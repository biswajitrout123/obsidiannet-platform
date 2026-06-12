import React, { useEffect, useState } from 'react';
import { useChatStore } from '../store/useChatStore';
import ChatBox from '../components/ChatBox';

// Sets the URL dynamically based on whether you are running locally or deployed
const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5000" : "YOUR_LIVE_BACKEND_URL_HERE";

export default function MessagesPage() {
  const { onlineUsers, selectedUser, setSelectedUser } = useChatStore();
  const [conversations, setConversations] = useState([]);

  // Fetch only users you have active conversations with (WhatsApp Style)
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        // Hitting the new endpoint using the dynamic BASE_URL
        const res = await fetch(`${BASE_URL}/api/messages/conversations`, { credentials: 'include' });
        const data = await res.json();
        
        if (Array.isArray(data)) {
            setConversations(data);
        }
      } catch (err) {
        console.error("Failed to load conversation users", err);
      }
    };
    fetchConversations();
  }, []);

  return (
    <div className="flex h-[calc(100vh-80px)] max-w-6xl mx-auto my-6 gap-4 px-4">
      {/* LEFT SIDEBAR: INBOX LIST */}
      <div className="w-1/3 bg-[#11131e] border border-[#1e2230] rounded-xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-[#1e2230] bg-[#090a0f]">
          <h2 className="text-xl font-bold text-gray-200">Inbox</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto divide-y divide-[#1e2230]/40 custom-scrollbar">
          {conversations.length === 0 ? (
            <div className="text-center text-gray-500 mt-10 text-sm">No recent conversations.</div>
          ) : (
            conversations.map((conv) => {
              const user = conv.user;
              const isOnline = onlineUsers.includes(user._id);
              const isSelected = selectedUser?._id === user._id;

              return (
                <button
                  key={user._id}
                  onClick={() => {
                      // Uses your Zustand store function to open ChatBox
                      if (setSelectedUser) {
                          setSelectedUser(user);
                      } else {
                          useChatStore.setState({ selectedUser: user });
                      }
                      
                      // Remove local red dot when opened
                      setConversations(prev => prev.map(c => 
                          c.partnerId === user._id ? { ...c, isUnread: false } : c
                      ));
                  }}
                  className={`w-full p-4 flex items-center gap-3 transition-colors text-left border-none cursor-pointer ${
                    isSelected ? 'bg-[#1e2230] border-l-4 border-l-blue-500' : 'hover:bg-[#1e2230]/30'
                  }`}
                >
                  <div className="relative">
                    {user.profilePicture ? (
                        <img src={user.profilePicture} alt="Profile" className="w-11 h-11 rounded-full object-cover border border-gray-700" />
                    ) : (
                        <div className="w-11 h-11 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                            {user.name.charAt(0)}
                        </div>
                    )}
                    
                    {isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#11131e] rounded-full" />
                    )}
                    {conv.isUnread && (
                      <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full shadow-[0_0_5px_rgba(239,68,68,0.8)] border border-[#11131e]"></span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm truncate ${conv.isUnread ? "font-bold text-white" : "font-semibold text-gray-200"}`}>
                        {user.name}
                    </h4>
                    <p className={`text-xs truncate ${conv.isUnread ? "text-blue-400 font-semibold" : "text-gray-400"}`}>
                        {conv.lastMessage || 'Sent an attachment'}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT SIDEBAR: ACTIVE CONVERSATION */}
      <div className="flex-1 flex bg-[#11131e] border border-[#1e2230] rounded-xl overflow-hidden relative">
        {!selectedUser ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                <svg className="w-16 h-16 mb-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                <p className="text-lg">Select a conversation to start chatting</p>
            </div>
        ) : (
            <ChatBox />
        )}
      </div>
    </div>
  );
}