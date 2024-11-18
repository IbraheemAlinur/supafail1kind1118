-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table first
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    location TEXT,
    website TEXT,
    custom_url TEXT UNIQUE,
    ki_points INTEGER NOT NULL DEFAULT 1000,
    role TEXT NOT NULL DEFAULT 'authenticated' CHECK (role IN ('authenticated', 'admin')),
    email_verified BOOLEAN NOT NULL DEFAULT false,
    email_notifications BOOLEAN NOT NULL DEFAULT true,
    last_active TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    skills JSONB DEFAULT '[]'::jsonb,
    social_links JSONB DEFAULT '{
        "website": null,
        "twitter": null,
        "github": null,
        "linkedin": null
    }'::jsonb,
    stats JSONB DEFAULT '{
        "monthlyPoints": 0,
        "quarterlyPoints": 0,
        "yearlyPoints": 0,
        "totalEarned": 0,
        "totalSpent": 0,
        "lastUpdated": null,
        "asksCompleted": 0,
        "offersCompleted": 0,
        "responseRate": 100,
        "averageRating": 0,
        "totalRatings": 0,
        "reputation": 0
    }'::jsonb,
    settings JSONB DEFAULT '{
        "theme": "light",
        "language": "en",
        "timezone": "UTC",
        "notifications": {
            "email": true,
            "browser": true,
            "mobile": true,
            "digest": "daily"
        },
        "privacy": {
            "showEmail": false,
            "showLocation": true,
            "showActivity": true
        }
    }'::jsonb
);

-- Create communities table
CREATE TABLE IF NOT EXISTS communities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    member_count INTEGER NOT NULL DEFAULT 0,
    visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'unlisted')),
    requires_approval BOOLEAN NOT NULL DEFAULT false,
    guidelines TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    settings JSONB DEFAULT '{
        "allowMemberPosts": true,
        "allowMemberEvents": true,
        "allowMemberInvites": true,
        "autoApproveMembers": true,
        "defaultKiPoints": {
            "ask": 100,
            "offer": 50
        },
        "categories": [],
        "tags": [],
        "moderation": {
            "requirePostApproval": false,
            "autoModeration": true,
            "bannedWords": []
        }
    }'::jsonb,
    stats JSONB DEFAULT '{
        "totalPosts": 0,
        "totalEvents": 0,
        "totalKiPoints": 0,
        "activeMembers": 0,
        "weeklyGrowth": 0,
        "monthlyGrowth": 0,
        "engagementRate": 0,
        "topContributors": []
    }'::jsonb
);

-- Create community_members table
CREATE TABLE IF NOT EXISTS community_members (
    community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (community_id, user_id)
);

-- Create community_tags table
CREATE TABLE IF NOT EXISTS community_tags (
    community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
    tag TEXT NOT NULL,
    PRIMARY KEY (community_id, tag)
);

-- Create community_application_questions table
CREATE TABLE IF NOT EXISTS community_application_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    sort_order INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_custom_url ON users(custom_url);
CREATE INDEX idx_communities_owner ON communities(owner_id);
CREATE INDEX idx_communities_visibility ON communities(visibility);
CREATE INDEX idx_community_members_user ON community_members(user_id);
CREATE INDEX idx_community_members_status ON community_members(status);
CREATE INDEX idx_community_tags_tag ON community_tags(tag);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_application_questions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Anyone can view user profiles"
    ON users FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can update their own profile"
    ON users FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- RLS Policies for communities
CREATE POLICY "Anyone can view public communities"
    ON communities FOR SELECT
    TO authenticated
    USING (visibility = 'public' OR visibility = 'unlisted');

CREATE POLICY "Members can view private communities"
    ON communities FOR SELECT
    TO authenticated
    USING (
        visibility = 'private' AND
        EXISTS (
            SELECT 1 FROM community_members
            WHERE community_id = communities.id
            AND user_id = auth.uid()
            AND status = 'approved'
        )
    );

CREATE POLICY "Users can create communities"
    ON communities FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update communities"
    ON communities FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM community_members
            WHERE community_id = communities.id
            AND user_id = auth.uid()
            AND role = 'admin'
            AND status = 'approved'
        )
    );