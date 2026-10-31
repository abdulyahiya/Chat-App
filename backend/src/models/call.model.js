import mongoose from "mongoose";

const callSchema = new mongoose.Schema(
    {
        callerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        callType: {
            type: String,
            enum: ["video", "voice"],
            default: "voice",
        },
        status: {
            type: String,
            enum: ["completed", "missed", "rejected"],
            default: "completed",
        },
        duration: {
            type: Number, // in seconds
            default: 0,
        },
    },
    { timestamps: true }
);

const Call = mongoose.model("Call", callSchema);

export default Call;
