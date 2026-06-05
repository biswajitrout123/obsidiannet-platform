import { create } from 'zustand';

// ✅ Bulletproof dynamic URL: Localhost for dev, relative/env URL for production
const API_BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5000" : (import.meta.env.VITE_API_URL || "");

export const useAuthStore = create((set) => ({
  user: null,
  isCheckingAuth: true,
  isLoading: false,

  // 🔄 1. Automatically check if user is logged in on page refresh
  checkAuth: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        set({ user: data, isCheckingAuth: false });
      } else {
        set({ user: null, isCheckingAuth: false });
      }
    } catch (error) {
      console.error("Auth verification error:", error);
      set({ user: null, isCheckingAuth: false });
    }
  },

  // 🔐 2. Login Action
  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      
      set({ user: data.user || data, isLoading: false });
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, message: error.message };
    }
  },

  // 📝 3. Signup Action
  signup: async (name, email, password) => {
    set({ isLoading: true });
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Signup failed');

      set({ user: data.user || data, isLoading: false });
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, message: error.message };
    }
  },

  // 🚪 4. Logout Action
  logout: async () => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' });
      set({ user: null });
    } catch (error) {
      console.error("Logout error:", error);
    }
  }
}));