import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export default function NetworkPage() {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Updated to use Vite environment variables with a localhost fallback
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const PLACEHOLDER_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  const fetchNetworkUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/suggestions`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Error gathering network data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNetworkUsers();
  }, []);

  const handleConnectToggle = async (targetId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/connect/${targetId}`, {
        method: 'POST',
        credentials: 'include',
      });
      if (response.ok) {
        // Optimistically update frontend arrays instantly
        setUsers((prevUsers) =>
          prevUsers.map((u) => {
            if (u._id !== targetId) return u;
            const isConnected = u.connections?.includes(currentUser._id);
            const updatedConnections = isConnected
              ? u.connections.filter((id) => id !== currentUser._id)
              : [...(u.connections || []), currentUser._id];
            return { ...u, connections: updatedConnections };
          })
        );
      }
    } catch (error) {
      console.error("Could not alter handshake status:", error);
    }
  };

  if (isLoading) return <div className="text-white text-center mt-20 text-sm">Loading professional directory...</div>;

  return (
    <div className="w-full max-w-5xl mx-auto mt-4 px-4 pb-12 text-left">
      <h2 className="text-xl font-bold text-gray-200 mb-1 tracking-wide">Grow your Professional Network</h2>
      <p className="text-xs text-gray-500 font-medium mb-6">Discover structural peers and tech innovators across ObsidianNet.</p>

      {users.length === 0 ? (
        <div className="bg-[#11131e] border border-[#1e2230] rounded-xl p-8 text-center">
          <p className="text-gray-400 text-sm">You are currently the pioneering user of this network registry cluster!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {users.map((member) => {
            const amIConnected = member.connections?.includes(currentUser?._id);

            return (
              <div key={member._id} className="bg-[#11131e] border border-[#1e2230] rounded-xl overflow-hidden shadow-md flex flex-col justify-between relative hover:border-[#252a3d] transition-all">
                
                {/* Visual Banner Header card spacing context */}
                <div className="h-16 w-full bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border-b border-[#1e2230]/40"></div>
                
                {/* Profile Data Elements */}
                <div className="px-4 pb-4 pt-0 text-center flex-1 flex flex-col items-center relative">
                  <Link to={`/profile/${member.username}`} className="absolute -top-9">
                    <img 
                      src={member.profilePicture || PLACEHOLDER_AVATAR} 
                      alt={member.name} 
                      className="w-18 h-18 rounded-full border-4 border-[#11131e] bg-gray-900 object-cover shadow"
                    />
                  </Link>

                  <div className="mt-11 flex-1 flex flex-col items-center">
                    <Link to={`/profile/${member.username}`} className="text-sm font-bold text-gray-200 hover:text-blue-400 transition-colors">
                      {member.name}
                    </Link>
                    <p className="text-[11px] text-gray-400 font-medium mt-1 min-h-[32px] line-clamp-2 px-2">
                      {member.headline || "ObsidianNet Core Contributor"}
                    </p>
                    <p className="text-[10px] text-gray-500 font-semibold mt-2">
                      {member.connections?.length || 0} connections
                    </p>
                  </div>
                </div>

                {/* Handshake Command Execution Interface Trigger */}
                <div className="p-4 pt-0 bg-[#11131e]">
                  <button
                    onClick={() => handleConnectToggle(member._id)}
                    className={`w-full py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                      amIConnected
                        ? 'border-gray-600 bg-transparent text-gray-400 hover:bg-red-950/20 hover:text-red-400 hover:border-red-900/50'
                        : 'border-blue-500 bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                    }`}
                  >
                    {amIConnected ? "Disconnect" : "Connect"}
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}