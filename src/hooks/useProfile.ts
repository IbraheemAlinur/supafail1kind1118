import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { useMemoizedCallback } from './useMemoizedCallback';
import { UserRepository } from '../lib/supabase/repositories/userRepository';
import type { UserSchema } from '../lib/supabase/schemas/userSchema';

interface ProfileActivity {
  id: string;
  type: 'ask' | 'offer' | 'event' | 'community' | 'achievement';
  title: string;
  description: string;
  timestamp: string;
  status?: string;
  metadata?: Record<string, any>;
}

const userRepository = new UserRepository();

export function useProfile(userId?: string) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserSchema | null>(null);
  const [activity, setActivity] = useState<ProfileActivity[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const currentUser = useStore(state => state.user);
  const updateUser = useStore(state => state.updateUser);

  const fetchProfile = useMemoizedCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const targetId = userId || currentUser?.id;
      if (!targetId) {
        setError('No user ID provided');
        return;
      }

      const profileData = await userRepository.findById(targetId);
      if (!profileData) throw new Error('Profile not found');

      setProfile(profileData);
      updateUser(profileData);

      await fetchActivity(targetId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch profile';
      setError(message);
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, currentUser?.id, updateUser]);

  const fetchActivity = useMemoizedCallback(async (targetId: string) => {
    try {
      setActivityLoading(true);

      const posts = await userRepository.getActivity(targetId);

      const activities: ProfileActivity[] = (posts || []).map(post => ({
        id: post.id,
        type: post.type as 'ask' | 'offer',
        title: post.title,
        description: post.description,
        timestamp: post.created_at,
        status: post.status
      }));

      setActivity(activities);
    } catch (err) {
      console.error('Error fetching activity:', err);
    } finally {
      setActivityLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser?.id || userId) {
      fetchProfile();
    }
  }, [currentUser?.id, userId, fetchProfile]);

  return {
    profile,
    loading,
    error,
    activity,
    activityLoading,
    fetchProfile,
    isOwnProfile: !userId || userId === currentUser?.id
  };
}