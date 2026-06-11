import { create } from "zustand";
import { io } from "socket.io-client";
import { useAuthStore } from "./useAuthStore"; // Assuming you have this from earlier

const BASE_URL = "http://localhost:5000";

export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,
    socket: null,
    onlineUsers: [],

    connectSocket: () => {
        const authUser = useAuthStore.getState().user;
        if (!authUser || get().socket?.connected) return;

        const socket = io(BASE_URL, {
            query: {
                userId: authUser._id,
            },
        });

        socket.connect();
        set({ socket: socket });

        socket.on("getOnlineUsers", (userIds) => {
            set({ onlineUsers: userIds });
        });
    },

    disconnectSocket: () => {
        if (get().socket?.connected) get().socket.disconnect();
    },

    listenToMessages: () => {
        const socket = get().socket;
        if (!socket) return;

        socket.on("newMessage", (newMessage) => {
            // Only add the message if we are actively chatting with that person
            const isMessageSentFromSelectedUser = newMessage.senderId === get().selectedUser?._id;
            if (!isMessageSentFromSelectedUser) return;

            set({ messages: [...get().messages, newMessage] });
        });
    },

    stopListeningToMessages: () => {
        const socket = get().socket;
        if (!socket) return;
        socket.off("newMessage");
    },

    sendMessage: async (messageData) => {
        const { selectedUser, messages } = get();
        try {
            const res = await fetch(`${BASE_URL}/api/messages/send/${selectedUser._id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(messageData),
            });
            const data = await res.json();
            set({ messages: [...messages, data] });
        } catch (error) {
            console.error(error);
        }
    },
}));