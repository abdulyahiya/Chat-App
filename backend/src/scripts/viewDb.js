import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import Call from "../models/call.model.js";

const viewDatabase = async () => {
    let uri;
    const uriFile = path.join(process.cwd(), ".data", "mongo_uri.txt");

    if (fs.existsSync(uriFile)) {
        uri = fs.readFileSync(uriFile, "utf-8").trim();
    } else if (process.env.MONGODB_URI) {
        uri = process.env.MONGODB_URI;
    }

    if (!uri) {
        console.error("No active MongoDB instance found. Start your backend first with `npm run dev`.");
        process.exit(1);
    }

    await mongoose.connect(uri);

    console.log("\n=======================================================");
    console.log("             📊 CHAT-APP DATABASE VIEWER               ");
    console.log("=======================================================\n");

    // 1. Users
    const users = await User.find({}).select("-password");
    console.log(`👥 REGISTERED USERS (${users.length}):`);
    console.table(
        users.map((u) => ({
            ID: u._id.toString(),
            Name: u.fullName,
            Email: u.email,
            Created: u.createdAt?.toISOString().split("T")[0],
        }))
    );

    // 2. Messages
    const messages = await Message.find({}).populate("senderId receiverId", "fullName email");
    console.log(`\n💬 MESSAGES HISTORY (${messages.length}):`);
    if (messages.length > 0) {
        console.table(
            messages.map((m) => ({
                From: m.senderId?.fullName || "Unknown",
                To: m.receiverId?.fullName || "Unknown",
                Text: m.text ? (m.text.length > 30 ? m.text.slice(0, 30) + "..." : m.text) : "[Image]",
                HasImage: Boolean(m.image),
                Time: m.createdAt?.toLocaleTimeString(),
            }))
        );
    } else {
        console.log("No messages sent yet.");
    }

    // 3. Calls
    const calls = await Call.find({}).populate("callerId receiverId", "fullName email");
    console.log(`\n📞 CALL LOGS (${calls.length}):`);
    if (calls.length > 0) {
        console.table(
            calls.map((c) => ({
                Caller: c.callerId?.fullName || "Unknown",
                Receiver: c.receiverId?.fullName || "Unknown",
                Type: c.callType,
                Status: c.status,
                Duration: `${c.duration}s`,
                Time: c.createdAt?.toLocaleTimeString(),
            }))
        );
    } else {
        console.log("No calls logged yet.");
    }

    console.log("\n=======================================================\n");
    process.exit(0);
};

viewDatabase();
