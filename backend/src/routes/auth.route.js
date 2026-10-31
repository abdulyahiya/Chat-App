import express from "express";
import rateLimit from "express-rate-limit";
import {
    checkAuth,
    forgotPassword,
    login,
    logout,
    resetPassword,
    signup,
    updatePassword,
    updateProfile,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Production Rate Limiters
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limit each IP to 20 auth requests per window
    message: { message: "Too many login attempts from this IP. Please try again after 15 minutes." },
    standardHeaders: true,
    legacyHeaders: false,
});

const forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 8, // Limit each IP to 8 forgot password requests per window
    message: { message: "Too many password reset attempts. Please try again after 15 minutes." },
    standardHeaders: true,
    legacyHeaders: false,
});

const resetPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { message: "Too many reset attempts. Please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});

const updatePasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { message: "Too many password update attempts. Please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});

const updateProfileLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { message: "Too many profile updates. Please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});

router.post("/signup", authLimiter, signup);
router.post("/login", authLimiter, login);
router.post("/logout", logout);

router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
router.post("/reset-password/:token", resetPasswordLimiter, resetPassword);

router.put("/update-profile", protectRoute, updateProfileLimiter, updateProfile);
router.put("/update-password", protectRoute, updatePasswordLimiter, updatePassword);

router.get("/check", protectRoute, checkAuth);

export default router;