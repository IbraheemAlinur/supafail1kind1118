import { z } from 'zod';

export const communitySettingsSchema = z.object({
  allowMemberPosts: z.boolean().default(true),
  allowMemberEvents: z.boolean().default(true),
  allowMemberInvites: z.boolean().default(true),
  autoApproveMembers: z.boolean().default(true),
  defaultKiPoints: z.object({
    ask: z.number().min(0).default(100),
    offer: z.number().min(0).default(50)
  }),
  categories: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  moderation: z.object({
    requirePostApproval: z.boolean().default(false),
    autoModeration: z.boolean().default(true),
    bannedWords: z.array(z.string()).default([])
  })
});

export const communityStatsSchema = z.object({
  totalPosts: z.number().default(0),
  totalEvents: z.number().default(0),
  totalKiPoints: z.number().default(0),
  activeMembers: z.number().default(0),
  weeklyGrowth: z.number().default(0),
  monthlyGrowth: z.number().default(0),
  engagementRate: z.number().default(0),
  topContributors: z.array(z.any()).default([])
});

export const communitySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(3),
  description: z.string(),
  image_url: z.string().url().nullable(),
  owner_id: z.string().uuid(),
  member_count: z.number().default(0),
  visibility: z.enum(['public', 'private', 'unlisted']).default('public'),
  requires_approval: z.boolean().default(false),
  guidelines: z.string().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  settings: communitySettingsSchema,
  stats: communityStatsSchema
});

export const communityMemberSchema = z.object({
  community_id: z.string().uuid(),
  user_id: z.string().uuid(),
  role: z.enum(['member', 'moderator', 'admin']).default('member'),
  status: z.enum(['pending', 'approved', 'rejected']).default('pending'),
  joined_at: z.string().datetime()
});

export type CommunitySchema = z.infer<typeof communitySchema>;
export type CommunityMemberSchema = z.infer<typeof communityMemberSchema>;