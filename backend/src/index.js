import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import callRoutes from "./routes/call.route.js";
import { app, server } from "./lib/socket.js";

import path from "path";

dotenv.config();

const PORT = process.env.PORT || 5001;

// Trust reverse proxy (e.g. Render, Nginx, Heroku, Cloudflare)
app.set("trust proxy", 1);
app.disable("x-powered-by");

const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
];
if (process.env.CLIENT_URL && !allowedOrigins.includes(process.env.CLIENT_URL)) {
    allowedOrigins.push(process.env.CLIENT_URL);
}

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (like mobile apps, curl, server-to-server)
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(null, false);
            }
        },
        credentials: true,
    })
);

// Basic Security Headers Middleware
app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    next();
});

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));
app.use(cookieParser());

// Serve uploaded documents securely with attachment header to prevent stored XSS
app.use(
    "/uploads",
    express.static(path.join(process.cwd(), "uploads"), {
        setHeaders: (res, filePath) => {
            res.setHeader("X-Content-Type-Options", "nosniff");
            // Force download for non-image files to avoid script execution in browser
            const ext = path.extname(filePath).toLowerCase();
            const safeInlineExts = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
            if (!safeInlineExts.includes(ext)) {
                res.setHeader("Content-Disposition", "attachment");
            }
        },
    })
);

import fs from "fs";

const __dirname = path.resolve();

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/calls", callRoutes);

// Production Frontend Serving
if (process.env.NODE_ENV === "production") {
    const frontendDist = fs.existsSync(path.join(__dirname, "frontend", "dist"))
        ? path.join(__dirname, "frontend", "dist")
        : path.join(__dirname, "..", "frontend", "dist");

    app.use(express.static(frontendDist));

    app.use((req, res) => {
        res.sendFile(path.join(frontendDist, "index.html"));
    });
}

server.listen(PORT, () => {
    console.log("server is running on PORT:" + PORT);
    connectDB();
});
