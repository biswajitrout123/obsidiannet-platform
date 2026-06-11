import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

// 🚀 Initialize Socket.io with CORS settings for your React frontend
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173"], // Change this to your Vercel URL later
        methods: ["GET", "POST"],
    },
});

// Store connected users to allow private 1-on-1 messaging
// Format: { userId: socketId }
export const getReceiverSocketId = (receiverId) => {
    return userSocketMap[receiverId];
};

const userSocketMap = {}; 

io.on("connection", (socket) => {
    console.log("A user connected", socket.id);

    const userId = socket.handshake.query.userId;
    if (userId !== "undefined") {
        userSocketMap[userId] = socket.id;
    }

    // Emit to all users who is online
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // Handle disconnects
    socket.on("disconnect", () => {
        console.log("User disconnected", socket.id);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

export { app, io, server };