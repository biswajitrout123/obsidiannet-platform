import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore'; 

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false); // ✅ Mobile menu state
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false); // ✅ Logout confirmation modal state

  const handleLogoutClick = async () => {
    await logout();
    setIsOpen(false); // Close menu on logout
    setIsLogoutModalOpen(false); // Close confirmation modal
    navigate('/login');
  };

  const closeMenu = () => setIsOpen(false);

  return (
    <>
      <nav className="w-full bg-[#11131e] border-b border-[#1e2230] fixed top-0 left-0 right-0 z-50 shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          {/* Brand Platform Logo */}
          <div className="flex items-center">
            <Link to="/" onClick={closeMenu} className="text-xl font-bold tracking-wider text-blue-500 hover:text-blue-400 transition-colors">
              ObsidianNet
            </Link>
          </div>

          {/* 💻 DESKTOP NAVIGATION (Hidden on Mobile) */}
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-400">
            {user ? (
              <>
                <Link to="/" className="hover:text-gray-200 transition-colors py-1">Home</Link>
                <Link to="/network" className="hover:text-gray-200 transition-colors py-1">My Network</Link>
                <Link to="/jobs" className="hover:text-gray-200 transition-colors py-1">Jobs</Link>
                <Link 
                  to={`/profile/${user.username}`} 
                  className="hover:text-gray-200 transition-colors py-1 font-semibold text-gray-300 border-b-2 border-transparent hover:border-blue-500"
                >
                  Profile
                </Link>
                <button 
                  onClick={() => setIsLogoutModalOpen(true)}
                  className="ml-4 px-4 py-1.5 rounded-full bg-red-950/30 hover:bg-red-900/50 text-red-400 hover:text-red-300 text-xs font-semibold tracking-wide border border-red-900/40 transition-all cursor-pointer"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-white transition-colors">Login</Link>
                <Link to="/signup" className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors">Sign Up</Link>
              </>
            )}
          </div>

          {/* 📱 MOBILE HAMBURGER BUTTON */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-400 hover:text-white focus:outline-none p-2"
            >
              {isOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
              )}
            </button>
          </div>
        </div>

        {/* 📱 MOBILE DROPDOWN MENU */}
        {isOpen && (
          <div className="md:hidden absolute top-16 left-0 w-full bg-[#11131e] border-b border-[#1e2230] shadow-xl flex flex-col py-4 px-6 space-y-4">
            {user ? (
              <>
                <Link to="/" onClick={closeMenu} className="text-gray-300 hover:text-white text-base font-medium">Home</Link>
                <Link to="/network" onClick={closeMenu} className="text-gray-300 hover:text-white text-base font-medium">My Network</Link>
                <Link to="/jobs" onClick={closeMenu} className="text-gray-300 hover:text-white text-base font-medium">Jobs</Link>
                <Link to={`/profile/${user.username}`} onClick={closeMenu} className="text-gray-300 hover:text-white text-base font-medium">Profile</Link>
                <div className="pt-2 border-t border-[#1e2230]">
                  <button onClick={() => setIsLogoutModalOpen(true)} className="w-full text-left text-red-400 font-semibold py-2">Logout</button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" onClick={closeMenu} className="text-gray-300 hover:text-white text-base font-medium">Login</Link>
                <Link to="/signup" onClick={closeMenu} className="text-blue-500 font-semibold text-base">Sign Up</Link>
              </>
            )}
          </div>
        )}
      </nav>

      {/* 🪟 LOGOUT CONFIRMATION MODAL */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#11131e] border border-[#1e2230] w-full max-w-sm rounded-xl p-6 shadow-2xl relative text-center">
            
            <h3 className="text-lg font-bold text-gray-200 mb-2">Confirm Logout</h3>
            <p className="text-sm text-gray-400 mb-6">Are you sure you want to end your session on ObsidianNet?</p>
            
            <div className="flex justify-center space-x-4">
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(false)}
                className="px-6 py-2 bg-gray-900 hover:bg-gray-800 text-gray-400 text-xs font-semibold rounded-full border border-[#1e2230] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogoutClick}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-full transition-colors shadow-md cursor-pointer"
              >
                Yes, Logout
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}