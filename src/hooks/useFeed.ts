import { useState } from 'react';
import { useMemoizedCallback } from './useMemoizedCallback';
import { supabase } from '../lib/supabase/client';

export interface FeedItem {
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
  createdAt: Date;
  responseCount: number;
  isInterested?: boolean;
}

export function useFeed() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<FeedItem[]>([]);

  const fetchPosts = useMemoizedCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select(`
          id,
          title,
          description,
          type,
          ki_points,
          status,
          created_at,
          author:users!posts_author_id_fkey (
            id,
            name,
            avatar_url
          ),
          community:communities!posts_community_id_fkey (
            id,
            name
          ),
          post_tags (
            tag
          ),
          post_interested_users (
            user_id
          ),
          response_count
        `)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      const formattedPosts: FeedItem[] = (posts || []).map(post => ({
        id: post.id,
        title: post.title,
        description: post.description,
        type: post.type,
        kiPoints: post.ki_points,
        author: {
          id: post.author.id,
          name: post.author.name,
          avatar: post.author.avatar_url
        },
        community: post.community ? {
          id: post.community.id,
          name: post.community.name
        } : undefined,
        tags: post.post_tags.map((t: { tag: string }) => t.tag),
        status: post.status,
        createdAt: new Date(post.created_at),
        responseCount: post.response_count || 0,
        isInterested: false // This will be updated by the component based on user state
      }));

      setItems(formattedPosts);
      return formattedPosts;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch posts';
      setError(message);
      console.error('Error fetching posts:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    items,
    loading,
    error,
    fetchPosts
  };
}