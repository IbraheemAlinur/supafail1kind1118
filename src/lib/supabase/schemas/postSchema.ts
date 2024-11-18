import { z } from 'zod';

export const postStatsSchema = z.object({
  views: z.number().default(0),
  interested: z.number().default(0),
  responses: z.number().default(0),
  lastActivity: z.string().datetime().nullable(),
  averageResponseTime: z.number().nullable(),
  completionRate: z.number().nullable()
});

export const postMetadataSchema = z.object({
  attachments: z.array(z.string()).default([]),
  requirements: z.array(z.string()).default([]),
  timeEstimate: z.string().nullable(),
  preferredSkills: z.array(z.string()).default([]),
  completionCriteria: z.array(z.string()).default([])
});

export const postSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(3),
  description: z.string(),
  type: z.enum(['ask', 'offer']),
  ki_points: z.number().min(0),
  author_id: z.string().uuid(),
  community_id: z.string().uuid().nullable(),
  event_id: z.string().uuid().nullable(),
  status: z.enum(['open', 'in_progress', 'completed']).default('open'),
  visibility: z.enum(['public', 'private', 'unlisted']).default('public'),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  response_count: z.number().default(0),
  stats: postStatsSchema,
  metadata: postMetadataSchema,
  contexts: z.object({
    community_ids: z.array(z.string().uuid()).default([]),
    event_ids: z.array(z.string().uuid()).default([]),
    profile_ids: z.array(z.string().uuid()).default([])
  }).default({
    community_ids: [],
    event_ids: [],
    profile_ids: []
  }),
  visibility_rules: z.object({
    show_in_feed: z.boolean().default(true),
    show_in_profile: z.boolean().default(true),
    show_in_search: z.boolean().default(true),
    allowed_roles: z.array(z.string()).default(['authenticated']),
    required_ki_points: z.number().default(0)
  }).default({
    show_in_feed: true,
    show_in_profile: true,
    show_in_search: true,
    allowed_roles: ['authenticated'],
    required_ki_points: 0
  })
});

export type PostSchema = z.infer<typeof postSchema>;