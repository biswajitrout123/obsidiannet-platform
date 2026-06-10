import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export default function ProfilePage() {
  const { username } = useParams(); 
  const { user: currentUser } = useAuthStore();
  
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const PLACEHOLDER_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  useEffect(() => {
    const fetchProfileAndPosts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/api/users/profile/${username}`, {
          credentials: 'include',
        });
        
        if (!response.ok) {
          if (response.status === 404) throw new Error("User directory match not found");
          throw new Error("Failed to load profile parameters");
        }

        const data = await response.json();
        setProfileUser(data.user);
        setPosts(data.posts);
      } catch (err) {
        console.error("Profile fetch error:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (username) {
      fetchProfileAndPosts();
    }
  }, [username]);

  if (isLoading) return <div className="text-white text-center mt-20 text-sm">Syncing profile directory...</div>;
  if (error) return <div className="text-red-400 text-center mt-20 text-sm">⚠️ {error}</div>;
  if (!profileUser) return <div className="text-gray-400 text-center mt-20 text-sm">No profile data available.</div>;

  // 🚀 NEW: Check if the logged-in user owns this profile
  const isOwnProfile = currentUser?.username === profileUser.username;

  return (
    <div className="w-full max-w-2xl mx-auto mt-4 px-2 sm:px-4 pb-12 text-left">
      
      {/* 💳 Profile Header Card */}
      <div className="bg-[#11131e] border border-[#1e2230] rounded-xl overflow-hidden shadow-xl mb-6">
        {/* Banner */}
        <div className="h-32 sm:h-44 w-full bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border-b border-[#1e2230]/40 relative">
          {profileUser.coverBanner && (
            <img src={profileUser.coverBanner} alt="Banner" className="w-full h-full object-cover" />
          )}
        </div>

        {/* Profile Picture & Main Details */}
        <div className="px-4 pb-6 pt-0 relative">
          <div className="absolute -top-12 sm:-top-16 left-4">
            <img 
              src={profileUser.profilePicture || PLACEHOLDER_AVATAR} 
              alt={profileUser.name} 
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-[#11131e] bg-gray-900 object-cover shadow-lg"
            />
          </div>

          {/* 🚀 NEW: Edit Profile Button (Only shows for the profile owner) */}
          {isOwnProfile && (
            <div className="absolute top-3 right-4">
              <button className="bg-[#1e2230] hover:bg-[#252a3d] text-gray-200 text-xs sm:text-sm font-semibold py-1.5 px-4 rounded-full border border-gray-600 transition-all shadow-sm flex items-center gap-2">
                ⚙️ Edit Profile
              </button>
            </div>
          )}

          <div className="pt-14 sm:pt-18 pl-2">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-100 tracking-wide">{profileUser.name}</h2>
            <p className="text-xs sm:text-sm text-gray-400 font-medium mt-0.5">@{profileUser.username}</p>
            <p className="text-xs sm:text-sm text-gray-300 mt-2 leading-relaxed font-normal">
              {profileUser.headline || "ObsidianNet Core Member"}
            </p>
            
            {profileUser.location && (
              <p className="text-[11px] text-gray-500 font-semibold mt-2 flex items-center">
                📍 {profileUser.location}
              </p>
            )}

            <div className="mt-3 flex items-center space-x-4 text-xs font-semibold text-gray-500">
              <span>🤝 <strong className="text-gray-300">{profileUser.connections?.length || 0}</strong> connections</span>
            </div>
          </div>
        </div>

        {/* About Section */}
        {profileUser.bio && (
          <div className="px-6 py-4 border-t border-[#1e2230]/50 bg-[#090a0f]/30">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">About</h3>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{profileUser.bio}</p>
          </div>
        )}

        {/* Skills Section */}
        {profileUser.skills && profileUser.skills.length > 0 && (
          <div className="px-6 py-4 border-t border-[#1e2230]/50">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Skills</h3>
            <div className="flex flex-wrap gap-1.5">
              {profileUser.skills.map((skill, i) => (
                <span key={i} className="text-[11px] font-medium bg-[#1c1f2e] text-blue-400 border border-[#252a3d] px-2.5 py-1 rounded-md">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 📜 User's Activity / Posts Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-2 border-b border-[#1e2230] pb-2 pl-1">
          {profileUser.name}'s Activity ({posts.length})
        </h3>

        {posts.length === 0 ? (
          <div className="bg-[#11131e] border border-[#1e2230] rounded-xl p-8 text-center">
            <p className="text-gray-500 text-xs font-medium">This user hasn't broadcasted any insights or media updates yet.</p>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post._id} className="bg-[#11131e] border border-[#1e2230] rounded-xl p-4 sm:p-5 shadow-md text-left transition-all hover:border-[#252a3d]">
              
              {/* Header */}
              <div className="flex items-center space-x-2.5 sm:space-x-3 mb-3">
                <img 
                  src={profileUser.profilePicture || PLACEHOLDER_AVATAR} 
                  alt="" 
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border border-[#252a3d] bg-gray-800"
                />
                <div>
                  <h4 className="text-gray-200 font-semibold text-xs sm:text-sm tracking-wide">
                    {profileUser.name}
                  </h4>
                  <p className="text-[10px] sm:text-xs text-gray-500 font-medium">
                    {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Text Body */}
              <p className="text-gray-300 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed mb-3">
                {post.text}
              </p>
              
              {/* Post Image Container */}
              {post.img && (
                 <div className="rounded-lg overflow-hidden border border-[#1e2230] bg-[#090a0f] mb-3">
                   <img 
                     src={post.img.startsWith('http') ? post.img : `${API_BASE_URL}${post.img}`} 
                     alt="Post content asset" 
                     className="w-full h-auto max-h-[300px] sm:max-h-[400px] object-contain mx-auto" 
                   />
                 </div>
              )}

              {/* Counters footer strip */}
              <div className="flex space-x-4 border-t border-[#1e2230]/60 pt-2 text-gray-500 text-[11px] sm:text-xs font-medium">
                <span>❤️ {post.likes?.length || 0} Likes</span>
                <span>💬 {post.comments?.length || 0} Comments</span>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
}