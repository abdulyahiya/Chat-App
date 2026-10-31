import mongoose from "mongoose";
import Call from "../models/call.model.js";

export const createCallLog = async (req, res) => {
    try {
        const { receiverId, callType, status, duration } = req.body;
        const callerId = req.user._id;

        if (!receiverId) {
            return res.status(400).json({ message: "Receiver ID is required" });
        }

        if (!mongoose.Types.ObjectId.isValid(receiverId)) {
            return res.status(400).json({ message: "Invalid receiver ID format" });
        }

        if (String(callerId) === String(receiverId)) {
            return res.status(400).json({ message: "Caller and receiver cannot be the same user" });
        }

        const newCall = new Call({
            callerId,
            receiverId,
            callType: callType || "voice",
            status: status || "completed",
            duration: duration || 0,
        });

        await newCall.save();
        await newCall.populate("callerId", "fullName profilePic email");
        await newCall.populate("receiverId", "fullName profilePic email");

        res.status(201).json(newCall);
    } catch (error) {
        console.log("Error in createCallLog controller:", error.message);
        if (error.name === "CastError") {
            return res.status(400).json({ message: "Invalid parameter format" });
        }
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getCallLogs = async (req, res) => {
    try {
        const myId = req.user._id;

        const calls = await Call.find({
            $or: [{ callerId: myId }, { receiverId: myId }],
        })
            .populate("callerId", "fullName profilePic email")
            .populate("receiverId", "fullName profilePic email")
            .sort({ createdAt: -1 })
            .limit(50);

        res.status(200).json(calls);
    } catch (error) {
        console.log("Error in getCallLogs controller:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteCallLog = async (req, res) => {
    try {
        const { id } = req.params;
        const myId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid call log ID format" });
        }

        const call = await Call.findOne({
            _id: id,
            $or: [{ callerId: myId }, { receiverId: myId }],
        });

        if (!call) {
            return res.status(404).json({ message: "Call log not found" });
        }

        await Call.findByIdAndDelete(id);
        res.status(200).json({ message: "Call log deleted successfully" });
    } catch (error) {
        console.log("Error in deleteCallLog controller:", error.message);
        if (error.name === "CastError") {
            return res.status(400).json({ message: "Invalid call log ID format" });
        }
        res.status(500).json({ message: "Internal server error" });
    }
};

export const clearCallHistory = async (req, res) => {
    try {
        const myId = req.user._id;

        await Call.deleteMany({
            $or: [{ callerId: myId }, { receiverId: myId }],
        });

        res.status(200).json({ message: "Call history cleared successfully" });
    } catch (error) {
        console.log("Error in clearCallHistory controller:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};
