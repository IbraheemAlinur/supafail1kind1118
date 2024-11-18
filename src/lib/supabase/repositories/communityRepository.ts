import { supabase } from '../client';
import type { CommunitySchema, CommunityMemberSchema } from '../schemas/communitySchema';

export class CommunityRepository {
  async findAll() {
    const { data, error } = await supabase
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

    if (error) throw error;
    return data;
  }

  async findById(id: string): Promise<CommunitySchema | null> {
    const { data, error } = await supabase
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
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async create(community: Partial<CommunitySchema>): Promise<CommunitySchema> {
    const { data, error } = await supabase
      .from('communities')
      .insert([community])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, updates: Partial<CommunitySchema>): Promise<CommunitySchema> {
    const { data, error } = await supabase
      .from('communities')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async addMember(member: CommunityMemberSchema): Promise<CommunityMemberSchema> {
    const { data, error } = await supabase
      .from('community_members')
      .insert([member])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateMember(
    communityId: string,
    userId: string,
    updates: Partial<CommunityMemberSchema>
  ): Promise<CommunityMemberSchema> {
    const { data, error } = await supabase
      .from('community_members')
      .update(updates)
      .eq('community_id', communityId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}