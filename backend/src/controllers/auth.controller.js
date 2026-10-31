import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import cloudinary from "../lib/cloudinary.js";
import { sendPasswordResetEmail } from "../lib/email.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const signup = async (req, res) => {
    const { fullName, email, password } = req.body;
    try {
        if (!fullName || !email || !password) {
            return res.status(400).json({ message: "Please fill in all fields" });
        }

        if (typeof fullName !== "string" || !fullName.trim()) {
            return res.status(400).json({ message: "Full name must be a valid non-empty string" });
        }

        if (typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
            return res.status(400).json({ message: "Please provide a valid email address" });
        }

        if (typeof password !== "string" || password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        if (password.length > 128) {
            return res.status(400).json({ message: "Password cannot exceed 128 characters" });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail });

        if (user) return res.status(400).json({ message: "Email already exists" });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName: fullName.trim(),
            email: normalizedEmail,
            password: hashedPassword,
        });

        if (newUser) {
            await newUser.save();
            generateToken(newUser._id, res);

            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic,
            });
        } else {
            return res.status(400).json({ message: "Invalid user data" });
        }
    } catch (error) {
        console.log("Error in signup controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ message: "Please provide both email and password" });
        }

        if (typeof email !== "string" || typeof password !== "string") {
            return res.status(400).json({ message: "Invalid credentials format" });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generate jwt token
        generateToken(user._id, res);

        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
        });
    } catch (error) {
        console.log("Error in login controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const logout = (req, res) => {
    try {
        res.cookie("jwt", "", {
            maxAge: 0,
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV !== "development",
        });
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.log("Error in logout controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { profilePic } = req.body;
        const userId = req.user._id;

        if (!profilePic || typeof profilePic !== "string") {
            return res.status(400).json({ message: "Please provide a valid profile picture" });
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic);

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profilePic: uploadResponse.secure_url },
            { new: true }
        ).select("-password");

        res.status(200).json(updatedUser);
    } catch (error) {
        console.log("Error in update profile controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user._id;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Please provide both current and new password" });
        }

        if (typeof currentPassword !== "string" || typeof newPassword !== "string") {
            return res.status(400).json({ message: "Invalid password format" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: "New password must be at least 6 characters" });
        }

        if (newPassword.length > 128) {
            return res.status(400).json({ message: "New password cannot exceed 128 characters" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }

        if (currentPassword === newPassword) {
            return res.status(400).json({ message: "New password must be different from current password" });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        console.log("Error in updatePassword controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Please provide an email address" });
        }

        if (typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
            return res.status(400).json({ message: "Please provide a valid email address" });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail });

        console.log(`[ForgotPassword] Request for: "${normalizedEmail}" | User in DB: ${!!user}`);

        // Generate raw random reset token
        const rawToken = crypto.randomBytes(32).toString("hex");

        // Hash token for database storage (OWASP gold standard)
        const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

        if (user) {
            user.resetPasswordToken = hashedToken;
            user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 mins
            await user.save();

            // Resolve client base URL dynamically
            const hostHeader = req.get("host");
            const proto = req.headers["x-forwarded-proto"] || (req.secure ? "https" : "http");
            const requestOrigin = hostHeader ? `${proto}://${hostHeader}` : null;
            const originHeader = req.headers.origin;

            const isRenderOrigin = originHeader && originHeader.includes(".onrender.com");
            const isLocalOrigin = originHeader && (originHeader.includes("localhost") || originHeader.includes("127.0.0.1"));

            let clientBaseUrl = process.env.CLIENT_URL;
            if (originHeader && (isRenderOrigin || isLocalOrigin || originHeader === clientBaseUrl)) {
                clientBaseUrl = originHeader;
            } else if (!clientBaseUrl && requestOrigin) {
                clientBaseUrl = requestOrigin;
            } else if (!clientBaseUrl) {
                clientBaseUrl = "http://localhost:5173";
            }

            const resetUrl = `${clientBaseUrl.replace(/\/$/, "")}/reset-password/${rawToken}`;

            // Dispatch Email via Enterprise Pipeline
            console.log(`[ForgotPassword] Dispatching email to: ${user.email} with link: ${resetUrl}`);
            await sendPasswordResetEmail(user.email, resetUrl, user.fullName);

            return res.status(200).json({
                message: "Password reset link dispatched to your email address.",
            });
        }

        // Generic safe response to prevent email discovery attacks
        res.status(200).json({
            message: "If an account exists with this email, a password reset link has been dispatched.",
        });
    } catch (error) {
        console.log("Error in forgotPassword controller", error.message);
        res.status(500).json({ message: "Internal server error while processing password reset" });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!token) {
            return res.status(400).json({ message: "Password reset token is missing" });
        }

        if (!password || password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        // Hash incoming raw token to match against database hashed token
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: "Password reset link is invalid or has expired" });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ message: "Password reset successful! You can now log in with your new password." });
    } catch (error) {
        console.log("Error in resetPassword controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const checkAuth = (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log("Error in check auth controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};
