import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        fullName: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
        },
        profilePic: {
            type: String,
            default: "",
        },
        resetPasswordToken: {
            type: String,
            default: undefined,
            select: false,
        },
        resetPasswordExpires: {
            type: Date,
            default: undefined,
            select: false,
        },
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;