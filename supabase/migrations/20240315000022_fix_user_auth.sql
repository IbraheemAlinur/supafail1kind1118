-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_user_profile_updated ON public.users;
DROP FUNCTION IF EXISTS handle_new_user CASCADE;
DROP FUNCTION IF EXISTS sync_user_profile CASCADE;

-- Create enhanced user creation function with better error handling and constraints
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
    -- Prevent duplicate user creation
    IF EXISTS (SELECT 1 FROM public.users WHERE id = NEW.id) THEN
        RETURN NEW;
    END IF;

    -- Generate default avatar URL with error handling
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

    -- Update auth.users metadata with transaction lock
    PERFORM pg_advisory_xact_lock(hashtext('user_creation_lock'::text));
    
    UPDATE auth.users
    SET raw_app_meta_data = 
        COALESCE(raw_app_meta_data, '{}'::jsonb) || 
        jsonb_build_object(
            'role', 'authenticated',
            'userId', inserted_user_id,
            'ki_points', 1000
        ),
        raw_user_meta_data = 
        COALESCE(raw_user_meta_data, '{}'::jsonb) || 
        jsonb_build_object(
            'role', 'authenticated',
            'ki_points', 1000,
            'created_at', CURRENT_TIMESTAMP
        )
    WHERE id = NEW.id;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log error details
    INSERT INTO user_creation_logs (
        user_id,
        error_message,
        error_detail,
        created_at
    ) VALUES (
        NEW.id,
        SQLERRM,
        SQLSTATE,
        NOW()
    );
    
    -- Attempt to rollback any partial changes
    IF inserted_user_id IS NOT NULL THEN
        DELETE FROM public.users WHERE id = inserted_user_id;
    END IF;
    
    RAISE LOG 'Error in handle_new_user: % %', SQLERRM, SQLSTATE;
    RETURN NULL;
END;
$$;

-- Create function to sync user profile changes
CREATE OR REPLACE FUNCTION sync_user_profile()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Update auth.users metadata when public.users is updated
    UPDATE auth.users
    SET raw_app_meta_data = 
        COALESCE(raw_app_meta_data, '{}'::jsonb) || 
        jsonb_build_object(
            'role', NEW.role,
            'ki_points', NEW.ki_points,
            'last_updated', CURRENT_TIMESTAMP
        ),
        raw_user_meta_data = 
        COALESCE(raw_user_meta_data, '{}'::jsonb) || 
        jsonb_build_object(
            'name', NEW.name,
            'avatar_url', NEW.avatar_url,
            'role', NEW.role,
            'ki_points', NEW.ki_points,
            'last_active', CURRENT_TIMESTAMP
        )
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$;

-- Create triggers
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

CREATE TRIGGER on_user_profile_updated
    AFTER UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION sync_user_profile();

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_last_active ON users(last_active);
CREATE INDEX IF NOT EXISTS idx_users_ki_points ON users(ki_points);
CREATE INDEX IF NOT EXISTS idx_user_creation_logs_created_at ON user_creation_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_user_creation_logs_user_id ON user_creation_logs(user_id);

-- Add helper functions
CREATE OR REPLACE FUNCTION verify_user_exists(user_id UUID)
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

CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN (
        SELECT role 
        FROM users 
        WHERE id = user_id
    );
END;
$$;

-- Add constraints
ALTER TABLE users
    ADD CONSTRAINT users_email_check 
        CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    ADD CONSTRAINT users_ki_points_check 
        CHECK (ki_points >= 0),
    ADD CONSTRAINT users_role_check 
        CHECK (role IN ('authenticated', 'admin')),
    ALTER COLUMN email SET NOT NULL,
    ALTER COLUMN name SET NOT NULL,
    ALTER COLUMN role SET NOT NULL,
    ALTER COLUMN ki_points SET NOT NULL,
    ALTER COLUMN created_at SET NOT NULL,
    ALTER COLUMN updated_at SET NOT NULL;

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all profiles" ON users;
DROP POLICY IF EXISTS "Admins can update all profiles" ON users;

CREATE POLICY "Users can view their own profile"
    ON users FOR SELECT
    TO authenticated
    USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
    ON users FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can view all profiles"
    ON users FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update all profiles"
    ON users FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- Create function to make a user an admin
CREATE OR REPLACE FUNCTION make_user_admin(target_user_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Check if the executing user is an admin
    IF NOT EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Only admins can promote users to admin role';
    END IF;

    -- Update the user's role to admin
    UPDATE users
    SET role = 'admin'
    WHERE id = target_user_id;

    RETURN FOUND;
END;
$$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Create function to handle user deletion
CREATE OR REPLACE FUNCTION handle_user_deletion()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Delete related records
    DELETE FROM community_members WHERE user_id = OLD.id;
    DELETE FROM post_responses WHERE user_id = OLD.id;
    DELETE FROM post_interested_users WHERE user_id = OLD.id;
    DELETE FROM messages WHERE sender_id = OLD.id OR recipient_id = OLD.id;
    DELETE FROM transactions WHERE sender_id = OLD.id OR recipient_id = OLD.id;
    
    RETURN OLD;
END;
$$;

-- Create trigger for user deletion
CREATE TRIGGER on_user_deleted
    BEFORE DELETE ON users
    FOR EACH ROW
    EXECUTE FUNCTION handle_user_deletion();