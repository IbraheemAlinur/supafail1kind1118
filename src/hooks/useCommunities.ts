import { useState } from 'react';
import { useMemoizedCallback } from './useMemoizedCallback';
import { supabase } from '../lib/supabase/client';
import type { Database } from '../lib/supabase/types';

type Community = Database['public']['Tables']['communities']['Row'] & {
  members: Array<{
    id: string;
    name: string;
    avatar: string;
    role: 'member' | 'moderator' | 'admin';
    status: 'pending' | 'approved' | 'rejected';
    joinedAt: Date;
  }>;
};

export function useCommunities() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [communities, setCommunities] = useState<Community[]>([]);

  const fetchCommunities = useMemoizedCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching communities...');

      const { data: communitiesData, error: communitiesError } = await supabase
        .from('communities')
        .select(`
          *,
          members:community_members(
            user:users(
              id,
              name,
              avatar_url
            ),
            role,
            status,
            joined_at
          )
        `);

      if (communitiesError) {
        console.error('Error fetching communities:', communitiesError);
        throw communitiesError;
      }

      console.log('Raw communities data:', communitiesData);

      const formattedCommunities: Community[] = (communitiesData || []).map(community => {
        const members = (community.members || []).map((m: any) => ({
          id: m.user?.id,
          name: m.user?.name,
          avatar: m.user?.avatar_url,
          role: m.role,
          status: m.status,
          joinedAt: new Date(m.joined_at)
        })).filter(m => m.id && m.name); // Filter out any invalid members

        return {
          ...community,
          members
        };
      });

      console.log('Formatted communities:', formattedCommunities);

      setCommunities(formattedCommunities);
      return formattedCommunities;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch communities';
      setError(message);
      console.error('Error in useCommunities:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    communities,
    loading,
    error,
    fetchCommunities
  };
}