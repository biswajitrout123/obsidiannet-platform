import { create } from 'zustand';

// ✅ Bulletproof dynamic URL: Uses Vercel variable in production, Localhost in dev
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const usePostStore = create((set) => ({
  posts: [],
  isLoading: false,

  fetchPosts: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch(`${API_BASE_URL}/api/posts`, { credentials: 'include' });
      const data = await res.json();
      set({ posts: data, isLoading: false });
    } catch (error) {
      console.error("Error fetching posts:", error);
      set({ isLoading: false });
    }
  },
}));