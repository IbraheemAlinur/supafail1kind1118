import { supabase } from '../client';
import type { PostSchema } from '../schemas/postSchema';

export class PostRepository {
  async findAll(options?: {
    type?: 'ask' | 'offer';
    status?: 'open' | 'in_progress' | 'completed';
    communityId?: string;
    eventId?: string;
    authorId?: string;
  }) {
    let query = supabase
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
      `);

    if (options?.type) {
      query = query.eq('type', options.type);
    }

    if (options?.status) {
      query = query.eq('status', options.status);
    }

    if (options?.communityId) {
      query = query.eq('community_id', options.communityId);
    }

    if (options?.eventId) {
      query = query.eq('event_id', options.eventId);
    }

    if (options?.authorId) {
      query = query.eq('author_id', options.authorId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async findById(id: string): Promise<PostSchema | null> {
    const { data, error } = await supabase
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
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async create(post: Partial<PostSchema>): Promise<PostSchema> {
    const { data, error } = await supabase
      .from('posts')
      .insert([post])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, updates: Partial<PostSchema>): Promise<PostSchema> {
    const { data, error } = await supabase
      .from('posts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async addInterest(postId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('post_interested_users')
      .insert([{ post_id: postId, user_id: userId }]);

    if (error) throw error;
  }

  async removeInterest(postId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('post_interested_users')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);

    if (error) throw error;
  }
}