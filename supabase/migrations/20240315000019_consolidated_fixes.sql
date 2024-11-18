-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create helper function for safe jsonb operations
CREATE OR REPLACE FUNCTION safe_jsonb_set(
    target jsonb,
    path text[],
    value jsonb,
    create_missing boolean DEFAULT true
) RETURNS jsonb AS $$
BEGIN
    IF target IS NULL THEN
        target = '{}'::jsonb;
    END IF;
    RETURN jsonb_build_object(
        COALESCE(path[array_length(path,1)], ''),
        value
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN target || jsonb_build_object(path[array_length(path,1)], value);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Enhanced user creation function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    default_avatar TEXT;
BEGIN
    -- Generate default avatar URL
    default_avatar := 'https://ui-avatars.com/api/?name=' || 
                     COALESCE(NULLIF(NEW.raw_user_meta_data->>'name', ''), 
                             NULLIF(split_part(NEW.email, '@', 1), ''),
                             'User') || 
                     '&background=random';

    -- Insert new user with default values
    INSERT INTO public.users (
        id,
        email,
        name,
        avatar_url,
        ki_points,
        role,
        email_verified,
        created_at,
        updated_at,
        stats,
        settings
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', default_avatar),
        1000,
        'authenticated',
        COALESCE(NEW.email_confirmed_at IS NOT NULL, false),
        NOW(),
        NOW(),
        jsonb_build_object(
            'monthlyPoints', 0,
            'quarterlyPoints', 0,
            'yearlyPoints', 0,
            'totalEarned', 0,
            'totalSpent', 0,
            'lastUpdated', CURRENT_TIMESTAMP,
            'asksCompleted', 0,
            'offersCompleted', 0,
            'responseRate', 100,
            'averageRating', 0,
            'totalRatings', 0,
            'reputation', 0
        ),
        jsonb_build_object(
            'theme', 'light',
            'language', 'en',
            'timezone', COALESCE(NEW.raw_user_meta_data->>'timezone', 'UTC'),
            'notifications', jsonb_build_object(
                'email', true,
                'browser', true,
                'mobile', true,
                'digest', 'daily'
            ),
            'privacy', jsonb_build_object(
                'showEmail', false,
                'showLocation', true,
                'showActivity', true
            )
        )
    );

    -- Update auth metadata
    UPDATE auth.users
    SET raw_app_meta_data = 
        COALESCE(raw_app_meta_data, '{}'::jsonb) || 
        jsonb_build_object('role', 'authenticated'),
        raw_user_meta_data = 
        COALESCE(raw_user_meta_data, '{}'::jsonb) || 
        jsonb_build_object(
            'role', 'authenticated',
            'ki_points', 1000
        )
    WHERE id = NEW.id;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log error and continue
    INSERT INTO user_creation_logs (user_id, error_message, error_detail)
    VALUES (NEW.id, SQLERRM, SQLSTATE);
    RETURN NEW;
END;
$$;

-- Set up proper role permissions
DO $$ 
BEGIN
    -- Grant permissions to authenticator (Supabase's main role)
    GRANT USAGE ON SCHEMA public TO authenticator;
    
    -- Grant table permissions
    GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticator;
    GRANT INSERT, UPDATE, DELETE ON TABLE public.users TO authenticator;
    GRANT INSERT, UPDATE, DELETE ON TABLE public.posts TO authenticator;
    GRANT INSERT, UPDATE, DELETE ON TABLE public.post_responses TO authenticator;
    GRANT INSERT, UPDATE, DELETE ON TABLE public.post_interested_users TO authenticator;
    GRANT INSERT, UPDATE ON TABLE public.community_members TO authenticator;
    GRANT INSERT ON TABLE public.events TO authenticator;
    GRANT INSERT ON TABLE public.event_attendees TO authenticator;
    GRANT INSERT ON TABLE public.messages TO authenticator;
    GRANT INSERT ON TABLE public.transactions TO authenticator;
    
    -- Grant sequence permissions
    GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticator;
END $$;

-- Fix community member policies to avoid recursion
CREATE OR REPLACE FUNCTION is_community_member(community_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM community_members
        WHERE community_id = $1
        AND user_id = auth.uid()
        AND status = 'approved'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;

-- User policies
CREATE POLICY "Users can view public profiles"
    ON users FOR SELECT
    TO authenticator
    USING (true);

CREATE POLICY "Users can update own profile"
    ON users FOR UPDATE
    TO authenticator
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Post policies
CREATE POLICY "Users can view posts"
    ON posts FOR SELECT
    TO authenticator
    USING (
        visibility = 'public' OR
        author_id = auth.uid() OR
        (community_id IS NOT NULL AND is_community_member(community_id))
    );

CREATE POLICY "Users can create posts"
    ON posts FOR INSERT
    TO authenticator
    WITH CHECK (
        auth.uid() = author_id AND
        (community_id IS NULL OR is_community_member(community_id))
    );

-- Community policies
CREATE POLICY "Users can view communities"
    ON communities FOR SELECT
    TO authenticator
    USING (
        visibility IN ('public', 'unlisted') OR
        is_community_member(id)
    );

CREATE POLICY "Users can create communities"
    ON communities FOR INSERT
    TO authenticator
    WITH CHECK (owner_id = auth.uid());

-- Community member policies
CREATE POLICY "Users can view community members"
    ON community_members FOR SELECT
    TO authenticator
    USING (
        EXISTS (
            SELECT 1 FROM communities
            WHERE id = community_id
            AND (
                visibility IN ('public', 'unlisted') OR
                is_community_member(id)
            )
        )
    );

CREATE POLICY "Users can join communities"
    ON community_members FOR INSERT
    TO authenticator
    WITH CHECK (
        user_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM communities
            WHERE id = community_id
            AND visibility IN ('public', 'unlisted')
        )
    );

-- Create triggers
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_community_members_user_status 
    ON community_members(user_id, status);
CREATE INDEX IF NOT EXISTS idx_posts_visibility_community 
    ON posts(visibility, community_id);
CREATE INDEX IF NOT EXISTS idx_communities_visibility 
    ON communities(visibility);