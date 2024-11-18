import { useState } from 'react';
import { useMemoizedCallback } from './useMemoizedCallback';
import { PostRepository } from '../lib/supabase/repositories/postRepository';
import type { PostSchema } from '../lib/supabase/schemas/postSchema';

const postRepository = new PostRepository();

interface UsePostsOptions {
  type?: 'ask' | 'offer';
  status?: 'open' | 'in_progress' | 'completed';
  communityId?: string;
  eventId?: string;
  authorId?: string;
}

export function usePosts(options: UsePostsOptions = {}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [posts, setPosts] = useState<PostSchema[]>([]);

  const fetchPosts = useMemoizedCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await postRepository.findAll(options);
      setPosts(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch posts';
      setError(message);
      console.error('Error fetching posts:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [options]);

  const createPost = useMemoizedCallback(async (post: Partial<PostSchema>) => {
    try {
      setError(null);
      const data = await postRepository.create(post);
      setPosts(prev => [data, ...prev]);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create post';
      setError(message);
      throw err;
    }
  }, []);

  const updatePost = useMemoizedCallback(async (id: string, updates: Partial<PostSchema>) => {
    try {
      setError(null);
      const data = await postRepository.update(id, updates);
      setPosts(prev => prev.map(p => p.id === id ? data : p));
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update post';
      setError(message);
      throw err;
    }
  }, []);

  const deletePost = useMemoizedCallback(async (id: string) => {
    try {
      setError(null);
      await postRepository.delete(id);
      setPosts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete post';
      setError(message);
      throw err;
    }
  }, []);

  return {
    posts,
    loading,
    error,
    fetchPosts,
    createPost,
    updatePost,
    deletePost
  };
}