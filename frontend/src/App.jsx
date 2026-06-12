import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore'; 
import { io } from 'socket.io-client';
import axios from 'axios';

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

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5000" : "YOUR_LIVE_BACKEND_URL_HERE";

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const { user, isCheckingAuth, checkAuth } = useAuthStore();
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false); // ✅ Global Notification State

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

  // ✅ NEW: Global Notification Listener
  useEffect(() => {
    if (!user || !user._id) return;

    // 1. Fetch initial unread status from Database on load
    const fetchUnreadStatus = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/api/messages/unread`, { withCredentials: true });
            setHasUnreadMessages(res.data.hasUnread);
        } catch (error) {
            console.error("Could not fetch unread status", error);
        }
    };
    fetchUnreadStatus();

    // 2. Listen globally for incoming messages to turn red dot ON
    const socket = io(BASE_URL, { query: { userId: user._id } });

    socket.on("receiveMessage", (incomingMessage) => {
        setHasUnreadMessages(true);
    });

    return () => {
        socket.disconnect();
    };
  }, [user]);

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
        
        {/* ✅ Passed Notification State to Navbar */}
        <Navbar hasUnreadMessages={hasUnreadMessages} setHasUnreadMessages={setHasUnreadMessages} />

        <main className="container mx-auto px-4 sm:px-6 flex flex-col items-center min-h-[calc(100vh-64px)] pt-24 pb-12 w-full max-w-full">
          <Routes>
            <Route path="/" element={user ? <FeedPage /> : <Navigate to="/login" replace />} />
            <Route path="/network" element={user ? <NetworkPage /> : <Navigate to="/login" replace />} />
            <Route path="/profile/:username" element={user ? <ProfilePage /> : <Navigate to="/login" replace />} />
            <Route path="/jobs" element={user ? <JobsPage /> : <Navigate to="/login" replace />} />
            <Route path="/messages" element={user ? <MessagesPage /> : <Navigate to="/login" replace />} />
            <Route path="/chat/:targetUserId" element={user ? <ChatPage /> : <Navigate to="/login" replace />} />

            <Route 
                path="/recruiter/dashboard" 
                element={user?.role === 'recruiter' ? <RecruiterDashboard /> : <Navigate to="/" replace />} 
            />
            <Route 
                path="/post-job" 
                element={user?.role === 'recruiter' ? <PostJobPage /> : <Navigate to="/" replace />} 
            />

            <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" replace />} />
            <Route path="/signup" element={!user ? <SignupPage /> : <Navigate to="/" replace />} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}