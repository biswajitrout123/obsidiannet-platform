import { create } from 'zustand';

export const usePostStore = create((set) => ({
  posts: [],
  isLoading: false,

  fetchPosts: async () => {
    set({ isLoading: true });
    try {
      // Calls your new GET /api/posts route
      const res = await fetch('http://localhost:5000/api/posts', { credentials: 'include' });
      const data = await res.json();
      set({ posts: data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
    }
  },
}));