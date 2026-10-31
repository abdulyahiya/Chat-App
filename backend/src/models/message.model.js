import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        text: {
            type: String,
        },
        image: {
            type: String,
        },
        // Document / File Attachment
        file: {
            url: { type: String },
            name: { type: String },
            size: { type: Number },
            fileType: { type: String },
        },
        // Live GPS Location
        location: {
            latitude: { type: Number },
            longitude: { type: Number },
            address: { type: String },
        },
    },
    { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;