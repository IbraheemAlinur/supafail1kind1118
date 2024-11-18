import { supabase } from '../client';
import type { UserSchema } from '../schemas/userSchema';

export class UserRepository {
  async findById(id: string): Promise<UserSchema | null> {
    const { data, error } = await supabase
      .from('users')
      .select()
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, updates: Partial<UserSchema>): Promise<UserSchema> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getActivity(userId: string) {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        id,
        title,
        type,
        status,
        created_at,
        description
      `)
      .eq('author_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;
    return data;
  }
}