import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
    clearCallHistory,
    createCallLog,
    deleteCallLog,
    getCallLogs,
} from "../controllers/call.controller.js";

const router = express.Router();

router.get("/", protectRoute, getCallLogs);
router.post("/", protectRoute, createCallLog);
router.delete("/clear", protectRoute, clearCallHistory);
router.delete("/:id", protectRoute, deleteCallLog);

export default router;
