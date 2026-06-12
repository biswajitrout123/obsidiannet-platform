import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

// ✅ NEW: Get all users the logged-in user has chatted with (WhatsApp-style Inbox)
export const getConversations = async (req, res) => {
    try {
        const userId = req.user._id;

        // Find all messages involving the logged-in user, newest first
        const messages = await Message.find({
            $or: [{ senderId: userId }, { receiverId: userId }]
        })
        .sort({ createdAt: -1 })
        .populate("senderId receiverId", "name profilePicture username headline");

        const conversationMap = new Map();

        messages.forEach((msg) => {
            // Determine who the "other" person is in the message
            const isSender = msg.senderId._id.toString() === userId.toString();
            const partner = isSender ? msg.receiverId : msg.senderId;
            const partnerId = partner._id.toString();

            // Only grab the latest message for each partner
            if (!conversationMap.has(partnerId)) {
                conversationMap.set(partnerId, {
                    partnerId,
                    user: partner,
                    lastMessage: msg.text,
                    isUnread: !isSender && !msg.isRead, // Red dot for unread in the list
                });
            }
        });

        res.status(200).json(Array.from(conversationMap.values()));
    } catch (error) {
        console.error("Error in getConversations:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Check if the logged-in user has ANY unread messages
export const getUnreadStatus = async (req, res) => {
    try {
        const unreadCount = await Message.countDocuments({
            receiverId: req.user._id,
            isRead: false
        });
        res.status(200).json({ hasUnread: unreadCount > 0 });
    } catch (error) {
        console.error("Error in getUnreadStatus:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Mark messages from a specific sender as read
export const markMessagesAsRead = async (req, res) => {
    try {
        const { senderId } = req.params;
        const receiverId = req.user._id;

        await Message.updateMany(
            { senderId, receiverId, isRead: false },
            { $set: { isRead: true } }
        );

        res.status(200).json({ message: "Messages marked as read" });
    } catch (error) {
        console.error("Error in markMessagesAsRead:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { userToChatId } = req.params;
        const myId = req.user._id;

        if (!userToChatId) {
            return res.status(400).json({ error: "Target user ID is required" });
        }

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId },
            ],
        }).sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (error) {
        console.error("Error in getMessages: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { text } = req.body;
        const senderId = req.user._id;
        const receiverId = req.params.id || req.params.userToChatId || req.body.receiverId;

        if (!receiverId) {
            return res.status(400).json({ error: "Receiver ID configuration missing" });
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            isRead: false // Automatically unread on creation
        });

        await newMessage.save();

        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("receiveMessage", newMessage);
        }

        res.status(201).json(newMessage);
    } catch (error) {
        console.error("Error in sendMessage: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};