import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore'; 

export default function ProfilePage() {
  const { username } = useParams(); 
  const { user: currentUser } = useAuthStore(); 
  
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form Field States
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // ☁️ File Upload States for Cloudinary
  const [avatarFile, setAvatarFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [bannerPreview, setBannerPreview] = useState('');

  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  // ✅ Dynamic deployment base URL
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const PLACEHOLDER_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
  const DEFAULT_BANNER = "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070&auto=format&fit=crop";

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/profile/${username}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // ✅ FIXED: Safely unpack the user object from the response
        const userData = data.user ? data.user : data; 

        setProfileData(userData);
        
        // Sync database values to edit form states using the unpacked data
        setHeadline(userData.headline || '');
        setBio(userData.bio || '');
        setLocation(userData.location || '');
        setSkills(userData.skills ? userData.skills.join(', ') : '');
        setAvatarPreview(userData.profilePicture || PLACEHOLDER_AVATAR);
        setBannerPreview(userData.coverBanner || DEFAULT_BANNER);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [username]);

  // Handle local image file selection picks
  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === 'avatar') {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    } else if (type === 'banner') {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    // 🚀 Using FormData instead of JSON so images can upload to Cloudinary natively
    const formData = new FormData();
    formData.append('headline', headline);
    formData.append('bio', bio);
    formData.append('location', location);
    formData.append('skills', skills); // Handled safely as comma-separated or parsed string list

    if (avatarFile) formData.append('profilePicture', avatarFile);
    if (bannerFile) formData.append('coverBanner', bannerFile);

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/update`, {
        method: 'PUT',
        body: formData,
        credentials: 'include', // Important for cookies session verification
      });

      if (response.ok) {
        setIsModalOpen(false);
        setAvatarFile(null);
        setBannerFile(null);
        fetchProfile(); // Refresh timeline component updates
      }
    } catch (error) {
      console.error("Error updating profile details:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) return <div className="text-white text-center mt-20 text-sm">Loading profile timeline...</div>;
  if (!profileData) return <div className="text-white text-center mt-20 text-sm">User structure not found.</div>;

  // Check against username or _id securely
  const isOwnProfile = currentUser?.username === profileData.username || currentUser?._id === profileData._id;

  return (
    <div className="w-full max-w-3xl mx-auto mt-2 sm:mt-4 px-3 sm:px-4 pb-12">
      
      {/* 🖼️ Cover Banner & Avatar Section */}
      <div className="bg-[#11131e] border border-[#1e2230] rounded-xl overflow-hidden shadow-lg text-left">
        <div className="h-32 sm:h-44 w-full bg-gray-800 relative">
          <img src={profileData.coverBanner || DEFAULT_BANNER} alt="Cover" className="w-full h-full object-cover" />
        </div>

        <div className="px-4 sm:px-6 pb-5 sm:pb-6 relative">
          <div className="absolute -top-10 sm:-top-14 left-4 sm:left-6">
            <img 
              src={profileData.profilePicture || PLACEHOLDER_AVATAR} 
              alt={profileData.name} 
              className="w-20 h-20 sm:w-28 sm:h-28 rounded-full border-[3px] sm:border-4 border-[#11131e] object-cover bg-gray-900 shadow-md"
            />
          </div>

          <div className="flex justify-end pt-3 sm:pt-4">
            {isOwnProfile ? (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="px-4 sm:px-5 py-1.5 border border-blue-500 hover:bg-blue-500/10 text-blue-400 rounded-full font-semibold transition-all text-[11px] sm:text-xs cursor-pointer"
              >
                ⚙️ Edit Profile
              </button>
            ) : (
              <button className="px-4 sm:px-5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold transition-colors text-[11px] sm:text-xs cursor-pointer">
                Connect
              </button>
            )}
          </div>

          <div className="mt-2 sm:mt-3">
            <h1 className="text-lg sm:text-xl font-bold text-gray-100 tracking-wide">{profileData.name}</h1>
            <p className="text-gray-400 text-[11px] sm:text-xs mt-1 font-medium">{profileData.headline || "ObsidianNet Professional Member"}</p>
            
            <div className="flex items-center space-x-3 sm:space-x-4 mt-2 sm:mt-3 text-[10px] sm:text-[11px] text-gray-500 font-medium">
              <span>📍 {profileData.location || "Location unassigned"}</span>
              <span className="text-blue-500 hover:underline cursor-pointer">{profileData.connections?.length || 0} connections</span>
            </div>
          </div>
        </div>
      </div>

      {/* 📝 About Section */}
      <div className="bg-[#11131e] border border-[#1e2230] rounded-xl p-4 sm:p-6 mt-4 shadow-lg text-left">
        <h2 className="text-xs sm:text-sm font-bold text-gray-400 tracking-wider uppercase mb-2">About Summary</h2>
        <p className="text-gray-300 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-normal">
          {profileData.bio || "No description provided yet."}
        </p>
      </div>

      {/* 🛠️ Skills Competencies Section */}
      <div className="bg-[#11131e] border border-[#1e2230] rounded-xl p-4 sm:p-6 mt-4 shadow-lg text-left">
        <h2 className="text-xs sm:text-sm font-bold text-gray-400 tracking-wider uppercase mb-2 sm:mb-3">Skills & Frameworks</h2>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {profileData.skills && profileData.skills.length > 0 ? (
            profileData.skills.map((skill, index) => (
              <span key={index} className="px-2.5 sm:px-3 py-1 bg-[#090a0f] border border-[#1e2230] text-gray-300 rounded-md text-[10px] sm:text-xs font-medium">
                {skill}
              </span>
            ))
          ) : (
            <p className="text-gray-600 text-[11px] sm:text-xs">No specific skill frameworks highlighted yet.</p>
          )}
        </div>
      </div>

      {/* 🪟 Interactive Modal Pop-Up Box Component */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#11131e] border border-[#1e2230] w-full max-w-lg rounded-xl p-5 sm:p-6 shadow-2xl relative text-left max-h-[90vh] overflow-y-auto">
            <h3 className="text-sm sm:text-base font-bold text-gray-200 border-b border-[#1e2230] pb-2 sm:pb-3 mb-3 sm:mb-4">Update Profile Details</h3>
            
            <form onSubmit={handleUpdateSubmit} className="space-y-3 sm:space-y-4">
              
              {/* 🖼️ Avatar & Banner Cloud Image Configs */}
              <div className="grid grid-cols-2 gap-4 bg-[#090a0f] p-3 rounded-lg border border-[#1e2230]/60">
                <div>
                  <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Profile Photo</label>
                  <div className="flex items-center space-x-2">
                    <img src={avatarPreview} className="w-10 h-10 rounded-full object-cover border border-[#1e2230]" alt="" />
                    <input type="file" ref={avatarInputRef} onChange={(e) => handleFileChange(e, 'avatar')} className="hidden" accept="image/*" />
                    <button type="button" onClick={() => avatarInputRef.current.click()} className="px-2 py-1 bg-[#1e2230] text-[10px] text-gray-300 rounded hover:bg-[#252a3d]">Change</button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Cover Banner</label>
                  <div className="flex items-center space-x-2">
                    <img src={bannerPreview} className="w-14 h-8 rounded object-cover border border-[#1e2230]" alt="" />
                    <input type="file" ref={bannerInputRef} onChange={(e) => handleFileChange(e, 'banner')} className="hidden" accept="image/*" />
                    <button type="button" onClick={() => bannerInputRef.current.click()} className="px-2 py-1 bg-[#1e2230] text-[10px] text-gray-300 rounded hover:bg-[#252a3d]">Change</button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] sm:text-xs text-gray-400 font-semibold mb-1">Professional Headline</label>
                <input 
                  type="text" 
                  value={headline} 
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g., Full Stack Engineer | React & Node.js"
                  className="w-full bg-[#090a0f] text-gray-200 text-xs border border-[#1e2230] rounded-lg p-2 sm:p-2.5 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] sm:text-xs text-gray-400 font-semibold mb-1">Geographic Location</label>
                <input 
                  type="text" 
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., New York, USA"
                  className="w-full bg-[#090a0f] text-gray-200 text-xs border border-[#1e2230] rounded-lg p-2 sm:p-2.5 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] sm:text-xs text-gray-400 font-semibold mb-1">Professional Bio Summary</label>
                <textarea 
                  value={bio} 
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell others about your trajectory, domain stack, and objectives..."
                  className="w-full bg-[#090a0f] text-gray-200 text-xs border border-[#1e2230] rounded-lg p-2 sm:p-2.5 focus:outline-none focus:border-blue-500 resize-none min-h-[70px] sm:min-h-[80px]"
                />
              </div>

              <div>
                <label className="block text-[11px] sm:text-xs text-gray-400 font-semibold mb-1">Skills (Comma-Separated)</label>
                <input 
                  type="text" 
                  value={skills} 
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g., React, Express, MongoDB, UI Design"
                  className="w-full bg-[#090a0f] text-gray-200 text-xs border border-[#1e2230] rounded-lg p-2 sm:p-2.5 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-2 sm:space-x-3 pt-3 border-t border-[#1e2230]/60 mt-3 sm:mt-4">
                <button 
                  type="button" 
                  onClick={() => { setIsModalOpen(false); fetchProfile(); }}
                  className="px-3 sm:px-4 py-1.5 bg-gray-900 hover:bg-gray-800 text-gray-400 text-[11px] sm:text-xs font-semibold rounded-full transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isUpdating}
                  className="px-4 sm:px-5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white text-[11px] sm:text-xs font-semibold rounded-full transition-all shadow-md"
                >
                  {isUpdating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}