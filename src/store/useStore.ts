import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Database } from '../lib/supabase/types';

type User = Database['public']['Tables']['users']['Row'];

interface Store {
  user: User | null;
  setUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useStore = create<Store>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null
      }))
    }),
    {
      name: '1kind-ai-storage',
      partialize: (state) => ({
        user: state.user
      }),
      version: 1
    }
  )
);