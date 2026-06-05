import { create } from 'zustand';

// ✅ Bulletproof dynamic URL: Localhost for dev, relative/env URL for production
const API_BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5000" : (import.meta.env.VITE_API_URL || "");

export const usePostStore = create((set) => ({
  posts: [],
  isLoading: false,

  fetchPosts: async () => {
    set({ isLoading: true });
    try {
      // Calls your new GET /api/posts route using the dynamic URL
      const res = await fetch(`${API_BASE_URL}/api/posts`, { credentials: 'include' });
      const data = await res.json();
      set({ posts: data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
    }
  },
}));