import mongoose from "mongoose";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

import fs from "fs";
import path from "path";

// Allowed extensions for documents/attachments to prevent stored XSS / remote code execution
const ALLOWED_DOCUMENT_EXTENSIONS = [
    ".pdf", ".doc", ".docx", ".txt", ".rtf", ".odt",
    ".xls", ".xlsx", ".csv",
    ".ppt", ".pptx",
    ".zip", ".tar", ".gz",
    ".png", ".jpg", ".jpeg", ".webp"
];

export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
        res.status(200).json(filteredUsers);
    } catch (error) {
        console.log("Error in getUsersForSidebar: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params;
        const myId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(userToChatId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId },
            ],
        }).sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (error) {
        console.log("Error in getMessages controller: ", error.message);
        if (error.name === "CastError") {
            return res.status(400).json({ message: "Invalid user ID" });
        }
        res.status(500).json({ error: "Internal server error" });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { text, image, file, location } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(receiverId)) {
            return res.status(400).json({ message: "Invalid receiver ID" });
        }

        // Prevent empty messages
        const hasText = typeof text === "string" && text.trim().length > 0;
        const hasImage = Boolean(image);
        const hasFile = Boolean(file && file.data);
        const hasLocation = Boolean(location && location.latitude && location.longitude);

        if (!hasText && !hasImage && !hasFile && !hasLocation) {
            return res.status(400).json({ message: "Cannot send an empty message" });
        }

        // Verify receiver user exists
        const receiverUser = await User.findById(receiverId);
        if (!receiverUser) {
            return res.status(404).json({ message: "Receiver user not found" });
        }

        let imageUrl;
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image, {
                folder: "chat_images",
            });
            imageUrl = uploadResponse.secure_url;
        }

        let fileData;
        if (file && file.data) {
            const originalName = file.name || "document.pdf";
            const ext = (path.extname(originalName) || ".pdf").toLowerCase();

            // Strict extension check to prevent Stored XSS & malicious script uploads
            if (!ALLOWED_DOCUMENT_EXTENSIONS.includes(ext)) {
                return res.status(400).json({
                    message: `File type "${ext}" is not allowed for security reasons. Allowed formats: ${ALLOWED_DOCUMENT_EXTENSIONS.join(", ")}`,
                });
            }

            try {
                const base64Data = file.data.includes(";base64,")
                    ? file.data.split(";base64,").pop()
                    : file.data;

                const safeBaseName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
                const uniqueFilename = `${Date.now()}_${safeBaseName}${ext}`;
                const uploadDir = path.join(process.cwd(), "uploads", "documents");

                await fs.promises.mkdir(uploadDir, { recursive: true });

                const filePath = path.join(uploadDir, uniqueFilename);
                // Asynchronous non-blocking write to protect event loop
                await fs.promises.writeFile(filePath, base64Data, { encoding: "base64" });

                const host = req.get("host") || "localhost:5001";
                const protocol = req.protocol || "http";
                const fileUrl = `${protocol}://${host}/uploads/documents/${uniqueFilename}`;

                fileData = {
                    url: fileUrl,
                    name: originalName,
                    size: file.size || Buffer.byteLength(base64Data, "base64"),
                    fileType: file.fileType || "application/octet-stream",
                };
            } catch (fileErr) {
                console.error("Error saving document:", fileErr);
                return res.status(500).json({ message: "Failed to save file attachment" });
            }
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text: hasText ? text.trim() : undefined,
            image: imageUrl,
            file: fileData,
            location: hasLocation ? location : undefined,
        });

        await newMessage.save();

        const receiverSocketIds = getReceiverSocketId(receiverId);
        if (Array.isArray(receiverSocketIds)) {
            receiverSocketIds.forEach((socketId) => {
                io.to(socketId).emit("newMessage", newMessage);
            });
        } else if (receiverSocketIds) {
            io.to(receiverSocketIds).emit("newMessage", newMessage);
        }

        res.status(201).json(newMessage);
    } catch (error) {
        console.log("Error in sendMessage controller: ", error.message);
        if (error.name === "CastError") {
            return res.status(400).json({ message: "Invalid ID parameter" });
        }
        res.status(500).json({ error: "Internal server error" });
    }
};