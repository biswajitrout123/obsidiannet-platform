import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore'; 

// Page Imports
import FeedPage from './pages/FeedPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';
import NetworkPage from './pages/NetworkPage';
import JobsPage from './pages/JobsPage';
import RecruiterDashboard from './pages/RecruiterDashboard';
import MessagesPage from './pages/MessagesPage'; 
import PostJobPage from './pages/PostJobPage';
import ChatPage from './pages/ChatPage';

// Component Imports
import Navbar from './components/Navbar'; 

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const { user, isCheckingAuth, checkAuth } = useAuthStore();

  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#090a0f] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 text-sm font-medium tracking-wide">Loading ObsidianNet...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-[#090a0f] text-[#f3f4f6] transition-colors duration-200 overflow-x-hidden">
        
        <Navbar />

        <main className="container mx-auto px-4 sm:px-6 flex flex-col items-center min-h-[calc(100vh-64px)] pt-24 pb-12 w-full max-w-full">
          <Routes>
            {/* Standard User Routes */}
            <Route path="/" element={user ? <FeedPage /> : <Navigate to="/login" replace />} />
            <Route path="/network" element={user ? <NetworkPage /> : <Navigate to="/login" replace />} />
            <Route path="/profile/:username" element={user ? <ProfilePage /> : <Navigate to="/login" replace />} />
            <Route path="/jobs" element={user ? <JobsPage /> : <Navigate to="/login" replace />} />
            <Route path="/messages" element={user ? <MessagesPage /> : <Navigate to="/login" replace />} />
            
            {/* ✅ Live Real-Time Chat Route (Protected) */}
            <Route path="/chat/:targetUserId" element={user ? <ChatPage /> : <Navigate to="/login" replace />} />

            {/* ✅ STRICT RECRUITER ROUTES: Only accessible if user.role === 'recruiter' */}
            <Route 
                path="/recruiter/dashboard" 
                element={user?.role === 'recruiter' ? <RecruiterDashboard /> : <Navigate to="/" replace />} 
            />
            <Route 
                path="/post-job" 
                element={user?.role === 'recruiter' ? <PostJobPage /> : <Navigate to="/" replace />} 
            />

            {/* Authentication Access Points */}
            <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" replace />} />
            <Route path="/signup" element={!user ? <SignupPage /> : <Navigate to="/" replace />} />
            
            {/* Catch-all Wildcard Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

      </div>
    </Router>
  );
}