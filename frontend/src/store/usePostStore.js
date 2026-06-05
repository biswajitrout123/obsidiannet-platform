import { create } from 'zustand';

// ✅ Dynamic API URL fallback config for development and deployment
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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