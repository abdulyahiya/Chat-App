import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import path from "path";
import fs from "fs";

let mongodInstance = null;

export const connectDB = async () => {
    // 1. External MongoDB URI (Atlas / Docker / Cloud Mongo)
    if (process.env.MONGODB_URI) {
        const isLegacyBrokenDevUri = process.env.NODE_ENV !== "production" && process.env.MONGODB_URI.includes("cluster0.9hyoo8o.mongodb.net");
        if (!isLegacyBrokenDevUri) {
            try {
                console.log("Attempting to connect to MongoDB URI...");
                const conn = await mongoose.connect(process.env.MONGODB_URI, {
                    serverSelectionTimeoutMS: 5000,
                });
                console.log(`MongoDB connected: ${conn.connection.host}`);
                return;
            } catch (error) {
                console.warn("MongoDB Atlas connection failed:", error.message);
                console.log("Falling back to embedded database engine...");
            }
        }
    }

    // 2. Embedded MongoDB Engine
    try {
        if (!mongodInstance) {
            const { MongoMemoryServer } = await import("mongodb-memory-server");
            const dbPath = path.join(process.cwd(), ".data", "db");
            if (!fs.existsSync(dbPath)) {
                fs.mkdirSync(dbPath, { recursive: true });
            }

            // Handle cleanup on process termination or nodemon restarts
            const cleanup = async () => {
                if (mongodInstance) {
                    try {
                        await mongodInstance.stop();
                    } catch (e) {}
                    mongodInstance = null;
                }
            };
            process.on("SIGINT", async () => { await cleanup(); process.exit(0); });
            process.on("SIGTERM", async () => { await cleanup(); process.exit(0); });
            process.once("SIGUSR2", async () => { await cleanup(); process.kill(process.pid, "SIGUSR2"); });

            mongodInstance = await MongoMemoryServer.create({
                instance: {
                    dbPath,
                },
            });
        }

        const uri = mongodInstance.getUri();
        const uriFile = path.join(process.cwd(), ".data", "mongo_uri.txt");
        fs.writeFileSync(uriFile, uri);

        const conn = await mongoose.connect(uri);
        console.log(`Embedded MongoDB connected successfully at ${uri}`);
        console.log(`📂 Data directory: ${path.join(process.cwd(), ".data", "db")}`);

        // Auto-seed initial demo users ONLY if the database is completely fresh
        const User = (await import("../models/user.model.js")).default;
        const count = await User.countDocuments();
        if (count === 0) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash("123456", salt);
            await User.create([
                {
                    email: "abdulyahya9973@gmail.com",
                    fullName: "Abdul Yahiya",
                    password: hashedPassword,
                    profilePic: "https://randomuser.me/api/portraits/men/32.jpg",
                },
                {
                    email: "baibhavipandey07@gmail.com",
                    fullName: "Baibhavi Pandey",
                    password: hashedPassword,
                    profilePic: "https://randomuser.me/api/portraits/women/24.jpg",
                },
                {
                    email: "emma.thompson@example.com",
                    fullName: "Emma Thompson",
                    password: hashedPassword,
                    profilePic: "https://randomuser.me/api/portraits/women/1.jpg",
                },
                {
                    email: "james.anderson@example.com",
                    fullName: "James Anderson",
                    password: hashedPassword,
                    profilePic: "https://randomuser.me/api/portraits/men/1.jpg",
                },
                {
                    email: "sophia.davis@example.com",
                    fullName: "Sophia Davis",
                    password: hashedPassword,
                    profilePic: "https://randomuser.me/api/portraits/women/3.jpg",
                },
                {
                    email: "alexander.martin@example.com",
                    fullName: "Alexander Martin",
                    password: hashedPassword,
                    profilePic: "https://randomuser.me/api/portraits/men/6.jpg",
                },
            ]);
            console.log("Initial demo users created and saved permanently to disk!");
        }
    } catch (fallbackError) {
        console.error("Critical error starting embedded database:", fallbackError);
    }
};