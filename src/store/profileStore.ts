import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Database } from '../lib/supabase/types';

type User = Database['public']['Tables']['users']['Row'];

interface ProfileStats {
  totalPosts: number;
  totalCommunities: number;
  totalKiPoints: number;
  monthlyKiPoints: number;
  quarterlyKiPoints: number;
  yearlyKiPoints: number;
}

interface ProfileStore {
  profiles: Record<string, User>;
  stats: Record<string, ProfileStats>;
  addProfile: (userId: string, profile: User) => void;
  updateProfile: (userId: string, updates: Partial<User>) => void;
  updateStats: (userId: string, stats: Partial<ProfileStats>) => void;
  getProfile: (userId: string) => User | undefined;
  getStats: (userId: string) => ProfileStats | undefined;
}

export const useProfileStore = create<ProfileStore>()(
  devtools(
    (set, get) => ({
      profiles: {},
      stats: {},
      addProfile: (userId, profile) =>
        set((state) => ({
          profiles: { ...state.profiles, [userId]: profile }
        })),
      updateProfile: (userId, updates) =>
        set((state) => ({
          profiles: {
            ...state.profiles,
            [userId]: { ...state.profiles[userId], ...updates }
          }
        })),
      updateStats: (userId, stats) =>
        set((state) => ({
          stats: {
            ...state.stats,
            [userId]: { ...state.stats[userId], ...stats }
          }
        })),
      getProfile: (userId) => get().profiles[userId],
      getStats: (userId) => get().stats[userId]
    }),
    { name: 'profile-store' }
  )
);