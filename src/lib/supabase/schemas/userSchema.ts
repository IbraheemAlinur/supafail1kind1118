import { z } from 'zod';

export const userStatsSchema = z.object({
  monthlyPoints: z.number().default(0),
  quarterlyPoints: z.number().default(0),
  yearlyPoints: z.number().default(0),
  totalEarned: z.number().default(0),
  totalSpent: z.number().default(0),
  lastUpdated: z.string().nullable(),
  asksCompleted: z.number().default(0),
  offersCompleted: z.number().default(0),
  responseRate: z.number().default(100),
  averageRating: z.number().default(0),
  totalRatings: z.number().default(0),
  reputation: z.number().default(0)
});

export const userSettingsSchema = z.object({
  theme: z.enum(['light', 'dark']).default('light'),
  language: z.string().default('en'),
  timezone: z.string().default('UTC'),
  notifications: z.object({
    email: z.boolean().default(true),
    browser: z.boolean().default(true),
    mobile: z.boolean().default(true),
    digest: z.enum(['daily', 'weekly', 'never']).default('daily')
  }),
  privacy: z.object({
    showEmail: z.boolean().default(false),
    showLocation: z.boolean().default(true),
    showActivity: z.boolean().default(true)
  })
});

export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(2),
  avatar_url: z.string().url().nullable(),
  bio: z.string().nullable(),
  ki_points: z.number().min(0).default(1000),
  role: z.enum(['authenticated', 'admin']).default('authenticated'),
  email_verified: z.boolean().default(false),
  last_active: z.string().datetime().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  stats: userStatsSchema,
  settings: userSettingsSchema
});

export type UserSchema = z.infer<typeof userSchema>;