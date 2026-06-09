import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export default function NetworkPage() {
  const { user: currentUser } = useAuthStore();
  
  // 👥 NEW: Dual State architecture for distinct sections
  const [connections, setConnections] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const PLACEHOLDER_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  const fetchNetworkData = async () => {
    try {
      // Execute both requests in parallel for maximum speed
      const [connectionsRes, suggestionsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/users/connections`, { credentials: 'include' }),
        fetch(`${API_BASE_URL}/api/users/suggestions`, { credentials: 'include' })
      ]);

      if (connectionsRes.ok && suggestionsRes.ok) {
        const connectionsData = await connectionsRes.json();
        const suggestionsData = await suggestionsRes.json();
        
        setConnections(connectionsData);
        setSuggestions(suggestionsData);
      }
    } catch (error) {
      console.error("Error gathering network data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNetworkData();
  }, []);

  const handleConnectToggle = async (targetUser, isConnecting) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/connect/${targetUser._id}`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        // 🚀 Optimistic UI Update: Move cards between sections instantly!
        if (isConnecting) {
          setSuggestions(prev => prev.filter(u => u._id !== targetUser._id));
          setConnections(prev => [{...targetUser, connections: [...(targetUser.connections || []), currentUser._id]}, ...prev]);
        } else {
          setConnections(prev => prev.filter(u => u._id !== targetUser._id));
          setSuggestions(prev => [{...targetUser, connections: (targetUser.connections || []).filter(id => id !== currentUser._id)}, ...prev]);
        }
      }
    } catch (error) {
      console.error("Could not alter handshake status:", error);
    }
  };

  if (isLoading) return <div className="text-white text-center mt-20 text-sm">Loading professional directory...</div>;

  // 📝 Reusable UI Component for User Cards
  const UserCard = ({ member, isConnection }) => (
    <div className="bg-[#11131e] border border-[#1e2230] rounded-xl overflow-hidden shadow-md flex flex-col justify-between relative hover:border-[#252a3d] transition-all">
      <div className="h-16 w-full bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border-b border-[#1e2230]/40"></div>
      
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

      <div className="p-4 pt-0 bg-[#11131e]">
        <button
          onClick={() => handleConnectToggle(member, !isConnection)}
          className={`w-full py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
            isConnection
              ? 'border-gray-600 bg-transparent text-gray-400 hover:bg-red-950/20 hover:text-red-400 hover:border-red-900/50'
              : 'border-blue-500 bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
          }`}
        >
          {isConnection ? "Disconnect" : "Connect"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-5xl mx-auto mt-4 px-4 pb-12 text-left">
      <h2 className="text-xl font-bold text-gray-200 mb-1 tracking-wide">My Network</h2>
      <p className="text-xs text-gray-500 font-medium mb-8">Manage your connections and discover new professionals.</p>

      {/* 🤝 Section 1: Connected Users */}
      <div className="mb-10">
        <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4 border-b border-[#1e2230] pb-2">
          Your Connections ({connections.length})
        </h3>
        {connections.length === 0 ? (
          <p className="text-gray-500 text-xs py-4">You haven't connected with anyone yet. Start growing your network below!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {connections.map((member) => (
              <UserCard key={`conn-${member._id}`} member={member} isConnection={true} />
            ))}
          </div>
        )}
      </div>

      {/* 🌟 Section 2: People You May Know */}
      <div>
        <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4 border-b border-[#1e2230] pb-2">
          People You May Know
        </h3>
        {suggestions.length === 0 ? (
          <p className="text-gray-500 text-xs py-4">No new suggestions at the moment. You've seen everyone!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {suggestions.map((member) => (
              <UserCard key={`sugg-${member._id}`} member={member} isConnection={false} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}