import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface Post {
  id: string;
  title: string;
  description: string;
  type: 'ask' | 'offer';
  kiPoints: number;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  community?: {
    id: string;
    name: string;
  };
  tags: string[];
  status: 'open' | 'in_progress' | 'completed';
  responseCount: number;
  createdAt: Date;
  interested_users?: { user_id: string }[];
}

interface FeedFilters {
  type: 'all' | 'asks' | 'offers';
  tags: string[];
  communities: string[];
  sortBy: 'trending' | 'recent';
  status: 'all' | 'open' | 'in_progress' | 'completed';
  userPosts: 'all' | 'mine' | 'interested';
  search: string;
}

interface FeedStore {
  items: Post[];
  filters: FeedFilters;
  setFilters: (filters: Partial<FeedFilters>) => void;
  addItem: (item: Post) => void;
  updateItem: (id: string, updates: Partial<Post>) => void;
  removeItem: (id: string) => void;
  clearItems: () => void;
}

export const useFeedStore = create<FeedStore>()(
  devtools(
    (set) => ({
      items: [],
      filters: {
        type: 'all',
        tags: [],
        communities: [],
        sortBy: 'trending',
        status: 'all',
        userPosts: 'all',
        search: ''
      },
      setFilters: (filters) =>
        set((state) => ({
          filters: { ...state.filters, ...filters },
        })),
      addItem: (item) =>
        set((state) => ({
          items: [item, ...state.items.filter(i => i.id !== item.id)],
        })),
      updateItem: (id, updates) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        })),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
      clearItems: () => set({ items: [] })
    }),
    { name: 'feed-store' }
  )
);