import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export default function ProfilePage() {
  const { username } = useParams(); 
  const navigate = useNavigate(); // Added for chat routing
  const { user: currentUser } = useAuthStore();
  
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal and Edit States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '', headline: '', bio: '', location: '', skills: ''
  });
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [coverBannerFile, setCoverBannerFile] = useState(null);

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

  const handleEditClick = () => {
    setEditForm({
      name: profileUser?.name || '',
      headline: profileUser?.headline || '',
      bio: profileUser?.bio || '',
      location: profileUser?.location || '',
      skills: profileUser?.skills ? profileUser.skills.join(', ') : ''
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const formData = new FormData();
      formData.append('name', editForm.name);
      formData.append('headline', editForm.headline);
      formData.append('bio', editForm.bio);
      formData.append('location', editForm.location);
      formData.append('skills', editForm.skills);

      if (profilePicFile) formData.append('profilePicture', profilePicFile);
      if (coverBannerFile) formData.append('coverBanner', coverBannerFile);

      const response = await fetch(`${API_BASE_URL}/api/users/profile/update`, {
        method: 'PUT', 
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) throw new Error("Failed to synchronize profile modifications");

      const updatedUser = await response.json();
      setProfileUser(updatedUser); 
      setIsModalOpen(false);
      window.location.reload(); 
    } catch (err) {
      console.error("Profile update error:", err);
      alert(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) return <div className="text-white text-center mt-20 text-sm">Syncing profile directory...</div>;
  if (error) return <div className="text-red-400 text-center mt-20 text-sm">⚠️ {error}</div>;
  if (!profileUser) return <div className="text-gray-400 text-center mt-20 text-sm">No profile data available.</div>;

  const isOwnProfile = currentUser?.username === profileUser.username;

  return (
    <div className="w-full max-w-2xl mx-auto mt-4 px-2 sm:px-4 pb-12 text-left relative">
      <div className="bg-[#11131e] border border-[#1e2230] rounded-xl overflow-hidden shadow-xl mb-6">
        <div className="h-32 sm:h-44 w-full bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border-b border-[#1e2230]/40 relative">
          {profileUser.coverBanner && (
            <img src={profileUser.coverBanner} alt="Banner" className="w-full h-full object-cover" />
          )}
        </div>

        <div className="px-4 pb-6 pt-0 relative">
          <div className="absolute -top-12 sm:-top-16 left-4">
            <img 
              src={profileUser.profilePicture || PLACEHOLDER_AVATAR} 
              alt={profileUser.name} 
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-[#11131e] bg-gray-900 object-cover shadow-lg"
            />
          </div>

          <div className="absolute top-3 right-4 flex gap-2">
            {isOwnProfile ? (
              <button 
                onClick={handleEditClick}
                className="bg-[#1e2230] hover:bg-[#252a3d] text-gray-200 text-xs sm:text-sm font-semibold py-1.5 px-4 rounded-full border border-gray-600 transition-all shadow-sm flex items-center gap-2 cursor-pointer"
              >
                ⚙️ Edit Profile
              </button>
            ) : (
              // 🚀 NEW VISIBLE CHAT BUTTON FOR OTHER USERS
              <button 
                onClick={() => navigate(`/chat/${profileUser._id}`)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold py-1.5 px-4 rounded-full transition-all shadow-sm flex items-center gap-2 cursor-pointer"
              >
                💬 Message
              </button>
            )}
          </div>

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

        {profileUser.bio && (
          <div className="px-6 py-4 border-t border-[#1e2230]/50 bg-[#090a0f]/30">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">About</h3>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{profileUser.bio}</p>
          </div>
        )}

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
              <div className="flex items-center space-x-2.5 sm:space-x-3 mb-3">
                <img 
                  src={profileUser.profilePicture || PLACEHOLDER_AVATAR} 
                  alt="" 
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border border-[#252a3d] bg-gray-800"
                />
                <div>
                  <h4 className="text-gray-200 font-semibold text-xs sm:text-sm tracking-wide">{profileUser.name}</h4>
                  <p className="text-[10px] sm:text-xs text-gray-500 font-medium">
                    {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <p className="text-gray-300 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed mb-3">{post.text}</p>
              {post.img && (
                 <div className="rounded-lg overflow-hidden border border-[#1e2230] bg-[#090a0f] mb-3">
                   <img 
                     src={post.img.startsWith('http') ? post.img : `${API_BASE_URL}${post.img}`} 
                     alt="Post content asset" 
                     className="w-full h-auto max-h-[300px] sm:max-h-[400px] object-contain mx-auto" 
                   />
                 </div>
              )}
              <div className="flex space-x-4 border-t border-[#1e2230]/60 pt-2 text-gray-500 text-[11px] sm:text-xs font-medium">
                <span>❤️ {post.likes?.length || 0} Likes</span>
                <span>💬 {post.comments?.length || 0} Comments</span>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-[#11131e] border border-[#1e2230] rounded-xl max-w-lg w-full p-5 sm:p-6 text-left space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#1e2230] pb-3">
              <h3 className="text-base font-bold text-gray-100 tracking-wide">Update Profile Records</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white text-sm font-semibold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-gray-400 font-medium mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className="w-full bg-[#090a0f] border border-[#252a3d] rounded-lg p-2.5 text-gray-100 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 font-medium mb-1">Professional Headline</label>
                <input 
                  type="text" 
                  value={editForm.headline}
                  onChange={(e) => setEditForm({...editForm, headline: e.target.value})}
                  className="w-full bg-[#090a0f] border border-[#252a3d] rounded-lg p-2.5 text-gray-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-medium mb-1">Location Context</label>
                <input 
                  type="text" 
                  value={editForm.location}
                  onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                  className="w-full bg-[#090a0f] border border-[#252a3d] rounded-lg p-2.5 text-gray-100 focus:outline-none focus:border-blue-500"
                  placeholder="e.g. London, UK"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-medium mb-1">Bio Summary</label>
                <textarea 
                  rows="3"
                  value={editForm.bio}
                  onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                  className="w-full bg-[#090a0f] border border-[#252a3d] rounded-lg p-2.5 text-gray-100 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-medium mb-1">Core Skills (Comma separated strings)</label>
                <input 
                  type="text" 
                  value={editForm.skills}
                  onChange={(e) => setEditForm({...editForm, skills: e.target.value})}
                  className="w-full bg-[#090a0f] border border-[#252a3d] rounded-lg p-2.5 text-gray-100 focus:outline-none focus:border-blue-500"
                  placeholder="MERN, React, Java, Node.js"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-gray-400 font-medium mb-1">Profile Avatar Image</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setProfilePicFile(e.target.files[0])}
                    className="w-full text-xs text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#1c1f2e] file:text-blue-400 hover:file:bg-[#252a3d] cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-medium mb-1">Background Landscape Banner</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setCoverBannerFile(e.target.files[0])}
                    className="w-full text-xs text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#1c1f2e] file:text-blue-400 hover:file:bg-[#252a3d] cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 border-t border-[#1e2230] pt-4 mt-2">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-[#1c1f2e] hover:bg-[#252a3d] text-gray-300 py-2 px-4 rounded-lg font-medium cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isUpdating}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:text-gray-400 text-white py-2 px-5 rounded-lg font-semibold transition-all cursor-pointer"
                >
                  {isUpdating ? "Syncing Uploads..." : "Save Modifications"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}