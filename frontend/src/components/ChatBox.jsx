import React, { useEffect, useState, useRef } from 'react';
import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/useAuthStore';
import { format } from "date-fns";

export default function ChatBox() {
    const { messages, sendMessage, listenToMessages, stopListeningToMessages, selectedUser } = useChatStore();
    const { user: authUser } = useAuthStore();
    const [text, setText] = useState("");
    const messagesEndRef = useRef(null);

    // 🔄 Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // 🎧 Start listening for real-time messages when component loads
    useEffect(() => {
        listenToMessages();
        return () => stopListeningToMessages();
    }, [listenToMessages, stopListeningToMessages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        
        await sendMessage({ text });
        setText("");
    };

    if (!selectedUser) {
        return <div className="flex-1 flex items-center justify-center text-gray-400">Select a conversation to start chatting</div>;
    }

    return (
        <div className="flex flex-col h-[600px] w-full max-w-2xl bg-[#11131e] border border-[#1e2230] rounded-xl overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-[#1e2230] bg-[#090a0f] flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                    {selectedUser.name.charAt(0)}
                </div>
                <div>
                    <h3 className="text-gray-200 font-medium">{selectedUser.name}</h3>
                    <p className="text-xs text-gray-500">Active now</p>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => {
                    const isMine = message.senderId === authUser._id;
                    return (
                        <div key={message._id} className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}>
                            <div className={`max-w-[70%] p-3 rounded-2xl ${isMine ? "bg-blue-600 text-white rounded-br-none" : "bg-[#1e2230] text-gray-200 rounded-bl-none"}`}>
                                <p className="text-sm">{message.text}</p>
                            </div>
                            <span className="text-[10px] text-gray-500 mt-1">
                                {format(new Date(message.createdAt), "hh:mm a")}
                            </span>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-[#1e2230] bg-[#090a0f] flex gap-2">
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-[#11131e] border border-[#1e2230] text-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                />
                <button 
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    Send
                </button>
            </form>
        </div>
    );
}