import express from "express";
import { getMessages, sendMessage } from "../controllers/message.controller.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

// Fetch chat history between logged-in user and target user
router.get("/:userToChatId", protectRoute, getMessages);

// Send a new message to a target user
router.post("/:id", protectRoute, sendMessage); 

export default router;