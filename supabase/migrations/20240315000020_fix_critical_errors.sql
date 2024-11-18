-- Fix user creation and foreign key issues
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    default_avatar TEXT;
    inserted_user_id UUID;
BEGIN
    -- Generate default avatar URL
    default_avatar := 'https://ui-avatars.com/api/?name=' || 
                     COALESCE(NULLIF(NEW.raw_user_meta_data->>'name', ''), 
                             NULLIF(split_part(NEW.email, '@', 1), ''),
                             'User') || 
                     '&background=random';

    -- Insert new user and get the ID
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
    ) RETURNING id INTO inserted_user_id;

    -- Ensure the user was actually created
    IF inserted_user_id IS NULL THEN
        RAISE EXCEPTION 'Failed to create user record';
    END IF;

    -- Update auth metadata
    UPDATE auth.users
    SET raw_app_meta_data = 
        COALESCE(raw_app_meta_data, '{}'::jsonb) || 
        jsonb_build_object(
            'role', 'authenticated',
            'user_id', inserted_user_id
        ),
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

-- Fix RLS policies for posts
DROP POLICY IF EXISTS "Users can create posts" ON posts;
CREATE POLICY "Users can create posts"
    ON posts FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() IS NOT NULL AND
        auth.uid() = author_id AND
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid()
        ) AND
        (
            community_id IS NULL OR
            EXISTS (
                SELECT 1 FROM community_members
                WHERE community_id = posts.community_id
                AND user_id = auth.uid()
                AND status = 'approved'
            )
        )
    );

-- Fix relationship conflicts in user profiles
CREATE OR REPLACE VIEW user_profiles AS
SELECT 
    u.*,
    (
        SELECT COUNT(*)
        FROM posts p
        WHERE p.author_id = u.id
    ) as total_posts,
    (
        SELECT COUNT(*)
        FROM community_members cm
        WHERE cm.user_id = u.id
        AND cm.status = 'approved'
    ) as total_communities,
    (
        SELECT jsonb_object_agg(
            c.id,
            jsonb_build_object(
                'name', c.name,
                'role', cm.role
            )
        )
        FROM community_members cm
        JOIN communities c ON cm.community_id = c.id
        WHERE cm.user_id = u.id
        AND cm.status = 'approved'
    ) as communities
FROM users u;

-- Fix community creation policy
DROP POLICY IF EXISTS "Users can create communities" ON communities;
CREATE POLICY "Users can create communities"
    ON communities FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() IS NOT NULL AND
        auth.uid() = owner_id AND
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid()
        )
    );

-- Add missing indexes
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_communities_owner_id ON communities(owner_id);
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(id);

-- Ensure proper role inheritance
GRANT authenticated TO authenticator;

-- Fix foreign key constraints
ALTER TABLE posts 
    DROP CONSTRAINT IF EXISTS posts_author_id_fkey,
    ADD CONSTRAINT posts_author_id_fkey 
    FOREIGN KEY (author_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE 
    DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE communities 
    DROP CONSTRAINT IF EXISTS communities_owner_id_fkey,
    ADD CONSTRAINT communities_owner_id_fkey 
    FOREIGN KEY (owner_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE 
    DEFERRABLE INITIALLY DEFERRED;

-- Add function to verify user exists
CREATE OR REPLACE FUNCTION user_exists(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users WHERE id = user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;