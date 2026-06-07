import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore'; // ✅ Connected to your Auth Store

export default function FeedPage() {
  const { user } = useAuthStore(); // ✅ Get the logged-in user profile dynamically
  const [posts, setPosts] = useState([]);
  const [postContent, setPostContent] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); 
  const [activeCommentBox, setActiveCommentBox] = useState(null);
  const [commentInputs, setCommentInputs] = useState({}); 
  const [isPosting, setIsPosting] = useState(false); 
  const fileInputRef = useRef(null);

  // ✅ Bulletproof dynamic URL setup
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const PLACEHOLDER_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  const fetchPosts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file)); 
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!postContent.trim() && !selectedImage) return;

    setIsPosting(true);
    const formData = new FormData();
    formData.append('content', postContent);
    if (selectedImage) formData.append('image', selectedImage);

    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/create`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (response.ok) {
        setPostContent('');
        handleRemoveImage();
        await fetchPosts(); 
      }
    } catch (error) {
      console.error("Error posting content:", error);
    } finally {
      setIsPosting(false);
    }
  };

  const handleLike = async (postId) => {
    if (!user) return; // Guard clause if auth state isn't ready
    const currentUserId = user._id || user.id; // ✅ Uses real logged-in user database ID

    try {
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post._id !== postId) return post;
          const hasLiked = post.likes?.includes(currentUserId);
          const updatedLikes = hasLiked
            ? post.likes.filter((id) => id !== currentUserId)
            : [...(post.likes || []), currentUserId];

          return { ...post, likes: updatedLikes };
        })
      );

      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/like`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!response.ok) fetchPosts(); 
    } catch (error) {
      console.error("Error liking post:", error);
      fetchPosts();
    }
  };

  const handleCommentSubmit = async (postId) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
        credentials: 'include',
      });

      if (response.ok) {
        setCommentInputs(prev => ({ ...prev, [postId]: '' }));
        fetchPosts(); 
      }
    } catch (error) {
      console.error("Error saving comment:", error);
    }
  };

  const handleCommentInputChange = (postId, value) => {
    setCommentInputs(prev => ({ ...prev, [postId]: value }));
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-2 sm:mt-4 px-2 sm:px-4 pb-12">
      
      {/* ✍️ Post Creation Box */}
      <div className="bg-[#11131e] border border-[#1e2230] rounded-xl p-3 sm:p-4 shadow-lg mb-4 sm:mb-6">
        <div className="flex space-x-2 sm:space-x-4">
          {/* ✅ Displays logged-in user's live profile picture */}
          <img 
            src={user?.profilePicture || PLACEHOLDER_AVATAR} 
            alt="Current User" 
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-full object-cover border border-[#1e2230] bg-gray-900 shadow-inner flex-shrink-0"
          />
          
          <form onSubmit={handlePostSubmit} className="flex-1">
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="What's on your mind? Share an insight..."
              className="w-full bg-[#090a0f] text-gray-200 placeholder-gray-500 border border-[#1e2230] rounded-lg p-2.5 sm:p-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none min-h-[70px] sm:min-h-[90px] transition-all text-xs sm:text-sm"
            />
            
            {imagePreview && (
              <div className="relative mt-2 sm:mt-3 rounded-lg overflow-hidden border border-[#1e2230] max-h-48 sm:max-h-60 bg-black flex items-center justify-center">
                <img src={imagePreview} alt="Upload preview" className="object-contain max-h-48 sm:max-h-60 w-full" />
                <button 
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white text-xs p-1.5 rounded-full transition-colors backdrop-blur-sm"
                >
                  ✕ Remove
                </button>
              </div>
            )}
            
            <div className="flex justify-between items-center mt-3 sm:mt-4 pt-2 border-t border-[#1e2230]/50">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                className="hidden" 
                accept="image/*" 
              />
              <button 
                type="button" 
                onClick={() => fileInputRef.current.click()} 
                className="text-gray-400 hover:text-blue-400 flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm font-medium transition-colors py-1 px-2 rounded-lg hover:bg-[#1c1f2e]"
              >
                <span className="text-sm sm:text-base">🖼️</span> <span>Media</span>
              </button>

              <button 
                type="submit" 
                disabled={isPosting || (!postContent.trim() && !selectedImage)}
                className="px-4 sm:px-6 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/40 disabled:text-gray-500 text-white rounded-full text-xs sm:text-sm font-semibold transition-all shadow-md flex items-center space-x-2"
              >
                {isPosting ? <span>Posting...</span> : <span>Post</span>}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 📜 Feed Timeline */}
      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post._id} className="bg-[#11131e] border border-[#1e2230] rounded-xl p-4 sm:p-5 shadow-md text-left transition-all hover:border-[#252a3d]">
            
            <Link 
              to={`/profile/${post.user?.username}`} 
              className="flex items-center space-x-2.5 sm:space-x-3 mb-3 sm:mb-4 group cursor-pointer w-fit hover:opacity-90 transition-opacity"
            >
              <img 
                src={post.user?.profilePicture || PLACEHOLDER_AVATAR} 
                alt={post.user?.name} 
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border border-[#252a3d] bg-gray-800"
              />
              <div>
                <h4 className="text-gray-200 font-semibold text-xs sm:text-sm tracking-wide group-hover:text-blue-400 transition-colors">
                  {post.user?.name || 'ObsidianNet User'}
                </h4>
                <p className="text-[10px] sm:text-xs text-gray-500 font-medium">
                  {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </Link>

            <p className="text-gray-300 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed mb-3 sm:mb-4">{post.content}</p>
            
            {post.image && (
               <div className="rounded-lg overflow-hidden border border-[#1e2230] bg-[#090a0f] mb-3 sm:mb-4">
                 <img src={`${API_BASE_URL}${post.image}`} alt="Post media" className="w-full h-auto max-h-[300px] sm:max-h-[450px] object-contain mx-auto" />
               </div>
            )}

            <div className="flex space-x-4 sm:space-x-6 border-t border-[#1e2230] pt-2 sm:pt-3 text-gray-400 text-[11px] sm:text-xs font-semibold">
              <button onClick={() => handleLike(post._id)} className="hover:text-pink-500 transition-colors flex items-center space-x-1 sm:space-x-1.5 py-1 px-2 rounded-md hover:bg-[#1c1f2e]">
                <span>❤️ {post.likes?.length || 0}</span> <span className="hidden sm:inline">Like</span>
              </button>
              <button onClick={() => setActiveCommentBox(activeCommentBox === post._id ? null : post._id)} className="hover:text-blue-400 transition-colors flex items-center space-x-1 sm:space-x-1.5 py-1 px-2 rounded-md hover:bg-[#1c1f2e]">
                <span>💬 {post.comments?.length || 0}</span> <span className="hidden sm:inline">Comment</span>
              </button>
            </div>

            {activeCommentBox === post._id && (
              <div className="mt-3 sm:mt-4 bg-[#090a0f] p-3 sm:p-4 rounded-xl border border-[#1e2230] space-y-3">
                <div className="max-h-40 sm:max-h-48 overflow-y-auto space-y-2 pr-1">
                  {post.comments?.map((c, i) => (
                    <div key={i} className="flex items-start space-x-2 bg-[#11131e]/50 p-2 sm:p-2.5 rounded-lg border border-[#1e2230]/30">
                      <Link to={`/profile/${c.user?.username}`}>
                        <img src={c.user?.profilePicture || PLACEHOLDER_AVATAR} className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover mt-0.5 hover:opacity-80 transition-opacity" alt="Commenter" />
                      </Link>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <Link to={`/profile/${c.user?.username}`} className="text-gray-200 font-semibold text-[11px] sm:text-xs hover:text-blue-400 transition-colors">
                            {c.user?.name || 'User'}
                          </Link>
                          <span className="text-[9px] sm:text-[10px] text-gray-500">{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ''}</span>
                        </div>
                        <p className="text-gray-400 text-[11px] sm:text-xs mt-0.5">{c.text}</p>
                      </div>
                    </div>
                  ))}
                  {(!post.comments || post.comments.length === 0) && (
                    <p className="text-gray-600 text-[11px] sm:text-xs text-center py-2">No comments yet. Be the first to share your thoughts!</p>
                  )}
                </div>

                <div className="flex mt-2 sm:mt-3 space-x-2 pt-2 border-t border-[#1e2230]/40">
                  <input 
                    type="text" 
                    value={commentInputs[post._id] || ''} 
                    onChange={(e) => handleCommentInputChange(post._id, e.target.value)} 
                    placeholder="Add a constructive comment..." 
                    className="flex-1 bg-[#11131e] text-white text-[11px] sm:text-xs rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 focus:outline-none border border-[#1e2230] focus:border-blue-500 transition-colors"
                  />
                  <button 
                    onClick={() => handleCommentSubmit(post._id)} 
                    disabled={!commentInputs[post._id]?.trim()}
                    className="text-blue-500 hover:text-blue-400 disabled:text-gray-600 font-semibold text-[11px] sm:text-xs px-2 sm:px-3 transition-colors"
                  >
                    Send
                  </button>
                </div>
              </div>
            )}

          </div>
        ))}
      </div>
    </div>
  );
}