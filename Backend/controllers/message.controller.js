import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

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
        }).sort({ createdAt: 1 }); // Oldest to newest

        res.status(200).json(messages);
    } catch (error) {
        console.error("Error in getMessages controller: ", error.message);
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
        });

        // 1. Save to database
        await newMessage.save();

        // 2. Emit real-time message to receiver
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("receiveMessage", newMessage);
        }

        res.status(201).json(newMessage);
    } catch (error) {
        console.error("Error in sendMessage controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};