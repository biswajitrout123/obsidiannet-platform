import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore'; 
import { io } from 'socket.io-client';

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5000" : "YOUR_LIVE_BACKEND_URL_HERE";

export default function ChatPage() {
  const { targetUserId } = useParams();
  const { user } = useAuthStore(); 
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [targetUser, setTargetUser] = useState(null);
  
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!user || !user._id) return;

    socketRef.current = io(BASE_URL, {
        query: { userId: user._id }
    }); 

    const fetchTargetUser = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/users/${targetUserId}`, { withCredentials: true });
        setTargetUser(res.data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    const fetchMessagesAndMarkRead = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/messages/${targetUserId}`, { withCredentials: true });
        setMessages(res.data);

        // ✅ NEW: Automatically ping backend to mark everything from this user as Read!
        await axios.put(`${BASE_URL}/api/messages/mark-read/${targetUserId}`, {}, { withCredentials: true });

      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchTargetUser();
    fetchMessagesAndMarkRead();

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [targetUserId, user]);

  useEffect(() => {
    if (!socketRef.current) return;

    socketRef.current.on("receiveMessage", (incomingMessage) => {
      if (incomingMessage.senderId === targetUserId || incomingMessage.receiverId === targetUserId) {
        setMessages((prev) => [...prev, incomingMessage]);
      }
    });

    return () => {
      socketRef.current.off("receiveMessage");
    };
  }, [targetUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const res = await axios.post(`${BASE_URL}/api/messages/${targetUserId}`, 
        { text: newMessage }, 
        { withCredentials: true }
      );
      
      setMessages((prev) => [...prev, res.data]);
      setNewMessage("");
      
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  return (
    <div className="w-full max-w-4xl bg-[#161822] rounded-lg border border-gray-800 flex h-[75vh]">
      
      {/* Left Sidebar */}
      <div className="w-1/3 border-r border-gray-800 p-4 bg-[#1e202e] rounded-l-lg flex flex-col items-center pt-8">
        {targetUser ? (
            <>
                <img 
                    src={targetUser.profilePicture || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                    alt="Profile" 
                    className="w-24 h-24 rounded-full object-cover border-2 border-blue-500 mb-4"
                />
                <h2 className="text-white font-bold text-lg">{targetUser.name}</h2>
                <p className="text-gray-400 text-sm">{targetUser.headline || "ObsidianNet Member"}</p>
            </>
        ) : (
            <p className="text-gray-400">Loading user...</p>
        )}
      </div>

      {/* Right Side - Chat */}
      <div className="w-2/3 flex flex-col relative">
        <div className="p-4 border-b border-gray-800 bg-[#1e202e] rounded-tr-lg flex items-center gap-3">
             <img 
                src={targetUser?.profilePicture || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                alt="Profile" 
                className="w-8 h-8 rounded-full object-cover"
            />
            <span className="text-white font-medium">Chat with {targetUser?.name || "User"}</span>
        </div>

        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
          {messages.map((msg, idx) => {
            const isMe = msg.senderId === user._id;

            return (
              <div key={idx} className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}>
                {!isMe && (
                    <img 
                        src={targetUser?.profilePicture || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                        alt="Profile" 
                        className="w-6 h-6 rounded-full object-cover mr-2 self-end mb-1"
                    />
                )}
                <div className={`max-w-[70%] p-3 rounded-lg text-sm ${
                  isMe ? "bg-blue-600 text-white rounded-br-none" : "bg-[#38434d] text-gray-200 rounded-bl-none"
                }`}>
                  {msg.text}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="p-4 bg-[#1e202e] border-t border-gray-800 rounded-br-lg flex gap-2">
          <input
            type="text"
            className="flex-1 bg-[#090a0f] border border-gray-700 text-white p-2 rounded-md focus:outline-none focus:border-blue-500"
            placeholder="Type your message here..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}