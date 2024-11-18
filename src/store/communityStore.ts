import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Database } from '../lib/supabase/types';

type Community = Database['public']['Tables']['communities']['Row'];
type CommunityMember = Database['public']['Tables']['community_members']['Row'];

interface CommunityStore {
  communities: Community[];
  userCommunities: string[];
  loading: boolean;
  error: string | null;
  addCommunity: (community: Community) => void;
  updateCommunity: (id: string, updates: Partial<Community>) => void;
  removeCommunity: (id: string) => void;
  addMember: (communityId: string, member: CommunityMember) => void;
  removeMember: (communityId: string, userId: string) => void;
  updateMemberRole: (communityId: string, userId: string, role: CommunityMember['role']) => void;
  updateMemberStatus: (communityId: string, userId: string, status: CommunityMember['status']) => void;
}

export const useCommunityStore = create<CommunityStore>()(
  devtools(
    (set) => ({
      communities: [],
      userCommunities: [],
      loading: false,
      error: null,
      addCommunity: (community) =>
        set((state) => ({
          communities: [...state.communities, community],
          userCommunities: [...state.userCommunities, community.id]
        })),
      updateCommunity: (id, updates) =>
        set((state) => ({
          communities: state.communities.map((community) =>
            community.id === id ? { ...community, ...updates } : community
          ),
        })),
      removeCommunity: (id) =>
        set((state) => ({
          communities: state.communities.filter((c) => c.id !== id),
          userCommunities: state.userCommunities.filter((cid) => cid !== id)
        })),
      addMember: (communityId, member) =>
        set((state) => ({
          communities: state.communities.map((community) =>
            community.id === communityId
              ? {
                  ...community,
                  members: [...community.members, member],
                  member_count: community.member_count + (member.status === 'approved' ? 1 : 0)
                }
              : community
          ),
        })),
      removeMember: (communityId, userId) =>
        set((state) => ({
          communities: state.communities.map((community) => {
            if (community.id !== communityId) return community;
            const member = community.members.find(m => m.user_id === userId);
            return {
              ...community,
              members: community.members.filter(m => m.user_id !== userId),
              member_count: community.member_count - (member?.status === 'approved' ? 1 : 0)
            };
          }),
        })),
      updateMemberRole: (communityId, userId, role) =>
        set((state) => ({
          communities: state.communities.map((community) =>
            community.id === communityId
              ? {
                  ...community,
                  members: community.members.map((m) =>
                    m.user_id === userId ? { ...m, role } : m
                  ),
                }
              : community
          ),
        })),
      updateMemberStatus: (communityId, userId, status) =>
        set((state) => ({
          communities: state.communities.map((community) =>
            community.id === communityId
              ? {
                  ...community,
                  members: community.members.map((m) =>
                    m.user_id === userId ? { ...m, status } : m
                  ),
                  member_count: community.member_count + 
                    (status === 'approved' ? 1 : (m.status === 'approved' ? -1 : 0))
                }
              : community
          ),
        })),
    }),
    { name: 'community-store' }
  )
);