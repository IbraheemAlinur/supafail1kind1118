import { useState } from 'react';
import { useFeedStore } from '../store/feedStore';
import { useStore } from '../store/useStore';
import { useMemoizedCallback } from './useMemoizedCallback';
import { supabase } from '../lib/supabase/client';
import type { Post } from '../store/feedStore';

interface CreatePostData {
  title: string;
  description: string;
  type: 'ask' | 'offer';
  kiPoints: number;
  tags: string[];
}

export function useCommunityPosts(communityId: string) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const addItem = useFeedStore(state => state.addItem);
  const user = useStore(state => state.user);

  const fetchPosts = useMemoizedCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('posts')
        .select(`
          *,
          author:users!posts_author_id_fkey(
            id,
            name,
            avatar_url
          ),
          community:communities!posts_community_id_fkey(
            id,
            name
          ),
          tags:post_tags(tag),
          interested_users:post_interested_users(user_id)
        `)
        .eq('community_id', communityId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const formattedPosts = data?.map(post => ({
        ...post,
        author: {
          id: post.author.id,
          name: post.author.name,
          avatar: post.author.avatar_url
        },
        community: post.community ? {
          id: post.community.id,
          name: post.community.name
        } : undefined,
        tags: post.tags.map(t => t.tag),
        createdAt: new Date(post.created_at),
        responseCount: post.response_count || 0
      })) || [];

      return formattedPosts;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch posts';
      setError(message);
      console.error('Error fetching posts:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [communityId]);

  const createPost = useMemoizedCallback(async (data: CreatePostData) => {
    if (!user) {
      throw new Error('Must be logged in to create a post');
    }

    try {
      setError(null);

      // First create the post
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .insert([{
          title: data.title,
          description: data.description,
          type: data.type,
          ki_points: data.kiPoints,
          author_id: user.id,
          community_id: communityId,
          status: 'open'
        }])
        .select()
        .single();

      if (postError) throw postError;

      // Then add tags
      if (data.tags.length > 0) {
        const { error: tagError } = await supabase
          .from('post_tags')
          .insert(
            data.tags.map(tag => ({
              post_id: postData.id,
              tag
            }))
          );

        if (tagError) throw tagError;
      }

      // Format and add the post to the store
      const formattedPost: Post = {
        ...postData,
        author: {
          id: user.id,
          name: user.name,
          avatar: user.avatar
        },
        community: {
          id: communityId,
          name: '' // This will be updated when posts are fetched
        },
        tags: data.tags,
        createdAt: new Date(postData.created_at),
        responseCount: 0
      };

      addItem(formattedPost);
      return formattedPost;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create post';
      setError(message);
      console.error('Error creating post:', err);
      throw err;
    }
  }, [user, communityId, addItem]);

  return {
    loading,
    error,
    createPost,
    fetchPosts
  };
}