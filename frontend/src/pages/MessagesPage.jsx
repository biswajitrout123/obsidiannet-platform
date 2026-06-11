import React, { useEffect, useState } from 'react';
import { useChatStore } from '../store/useChatStore';
import ChatBox from '../components/ChatBox';

export default function MessagesPage() {
  const { onlineUsers, selectedUser, setSelectedUser } = useChatStore();
  const [availableUsers, setAvailableUsers] = useState([]);

  // Fetch available users to chat with (Recruiters / Candidates)
  useEffect(() => {
    const fetchChatUsers = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/users', { credentials: 'include' });
        const data = await res.json();
        setAvailableUsers(data);
      } catch (err) {
        console.error("Failed to load conversation users", err);
      }
    };
    fetchChatUsers();
  }, []);

  return (
    <div className="flex h-[calc(100vh-80px)] max-w-6xl mx-auto my-6 gap-4 px-4">
      {/* LEFT SIDEBAR: USER LIST */}
      <div className="w-1/3 bg-[#11131e] border border-[#1e2230] rounded-xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-[#1e2230] bg-[#090a0f]">
          <h2 className="text-xl font-bold text-gray-200">Inbox</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto divide-y divide-[#1e2230]/40">
          {availableUsers.map((user) => {
            const isOnline = onlineUsers.includes(user._id);
            const isSelected = selectedUser?._id === user._id;

            return (
              <button
                key={user._id}
                onClick={() => useChatStore.setState({ selectedUser: user })}
                className={`w-full p-4 flex items-center gap-3 transition-colors text-left border-none cursor-pointer ${
                  isSelected ? 'bg-blue-600/10' : 'hover:bg-[#1e2230]/30'
                }`}
              >
                <div className="relative">
                  <div className="w-11 h-11 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                    {user.name.charAt(0)}
                  </div>
                  {isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#11131e] rounded-full" />
                  )}
                </div>
                <div className="flex-1 truncate">
                  <h4 className="text-sm font-semibold text-gray-200 truncate">{user.name}</h4>
                  <p className="text-xs text-gray-400 truncate">{user.headline || 'View profile conversation'}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT SIDEBAR: ACTIVE CONVERSATION */}
      <div className="flex-1 flex bg-[#11131e] border border-[#1e2230] rounded-xl overflow-hidden">
        <ChatBox />
      </div>
    </div>
  );
}