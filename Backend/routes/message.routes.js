import express from "express";
import { 
    getMessages, 
    sendMessage, 
    getUnreadStatus, 
    markMessagesAsRead,
    getConversations // ✅ NEW: Fetches the WhatsApp-style Inbox list
} from "../controllers/message.controller.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

// Fetch unread status globally for the Navbar red dot
router.get("/unread", protectRoute, getUnreadStatus);

// ✅ NEW: Fetch all recent conversations for the Inbox sidebar
router.get("/conversations", protectRoute, getConversations);

// Mark messages from a specific user as read when opening their chat
router.put("/mark-read/:senderId", protectRoute, markMessagesAsRead);

// Fetch chat history with a specific user
router.get("/:userToChatId", protectRoute, getMessages);

// Send message to a specific user
router.post("/:id", protectRoute, sendMessage); 

export default router;