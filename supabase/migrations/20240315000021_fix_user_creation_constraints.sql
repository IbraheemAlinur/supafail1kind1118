-- Create table for user creation logs if it doesn't exist
CREATE TABLE IF NOT EXISTS user_creation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    error_message TEXT,
    error_detail TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user CASCADE;

-- Create enhanced user creation function
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
    -- Check if user already exists to prevent duplicates
    IF EXISTS (SELECT 1 FROM public.users WHERE id = NEW.id) THEN
        RETURN NEW;
    END IF;

    -- Generate default avatar URL
    BEGIN
        default_avatar := 'https://ui-avatars.com/api/?name=' || 
                         COALESCE(NULLIF(NEW.raw_user_meta_data->>'name', ''), 
                                 NULLIF(split_part(NEW.email, '@', 1), ''),
                                 'User') || 
                         '&background=random';
    EXCEPTION WHEN OTHERS THEN
        default_avatar := 'https://ui-avatars.com/api/?name=User&background=random';
    END;

    -- Insert new user with RETURNING clause to ensure successful insertion
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

    -- Verify successful insertion
    IF inserted_user_id IS NULL THEN
        RAISE EXCEPTION 'Failed to create user record';
    END IF;

    -- Update auth.users metadata
    UPDATE auth.users
    SET raw_app_meta_data = 
        COALESCE(raw_app_meta_data, '{}'::jsonb) || 
        jsonb_build_object(
            'role', 'authenticated',
            'userId', inserted_user_id
        ),
        raw_user_meta_data = 
        COALESCE(raw_user_meta_data, '{}'::jsonb) || 
        jsonb_build_object(
            'role', 'authenticated',
            'ki_points', 1000
        )
    WHERE id = NEW.id;

    -- Wait for the transaction to complete
    PERFORM pg_advisory_xact_lock(hashtext('user_creation_lock'::text));

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log error details
    INSERT INTO user_creation_logs (user_id, error_message, error_detail)
    VALUES (NEW.id, SQLERRM, SQLSTATE);
    
    -- Attempt to rollback any partial changes
    IF inserted_user_id IS NOT NULL THEN
        DELETE FROM public.users WHERE id = inserted_user_id;
    END IF;
    
    RAISE LOG 'Error in handle_new_user: % %', SQLERRM, SQLSTATE;
    RETURN NULL;
END;
$$;

-- Recreate trigger with enhanced error handling
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Make foreign key constraints deferrable
ALTER TABLE posts 
    DROP CONSTRAINT IF EXISTS posts_author_id_fkey,
    ADD CONSTRAINT posts_author_id_fkey 
    FOREIGN KEY (author_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE 
    DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE communities 
    DROP CONSTRAINT IF EXISTS communities_owner_id_fkey,
    ADD CONSTRAINT communities_owner_id_fkey 
    FOREIGN KEY (owner_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE 
    DEFERRABLE INITIALLY IMMEDIATE;

-- Add function to safely check if user exists
CREATE OR REPLACE FUNCTION ensure_user_exists()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM users WHERE id = NEW.author_id) THEN
        RAISE EXCEPTION 'User does not exist';
    END IF;
    RETURN NEW;
END;
$$;

-- Add triggers to ensure user exists before post/community creation
CREATE TRIGGER ensure_post_author_exists
    BEFORE INSERT ON posts
    FOR EACH ROW
    EXECUTE FUNCTION ensure_user_exists();

CREATE TRIGGER ensure_community_owner_exists
    BEFORE INSERT ON communities
    FOR EACH ROW
    EXECUTE FUNCTION ensure_user_exists();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_id ON users(id);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_communities_owner_id ON communities(owner_id);

-- Update RLS policies to check user existence
DROP POLICY IF EXISTS "Users can create posts" ON posts;
CREATE POLICY "Users can create posts"
    ON posts FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() IS NOT NULL AND
        auth.uid() = author_id AND
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid())
    );

DROP POLICY IF EXISTS "Users can create communities" ON communities;
CREATE POLICY "Users can create communities"
    ON communities FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() IS NOT NULL AND
        auth.uid() = owner_id AND
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid())
    );

-- Function to verify user creation completed
CREATE OR REPLACE FUNCTION verify_user_creation(user_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE id = user_id 
        AND created_at IS NOT NULL
    );
END;
$$;