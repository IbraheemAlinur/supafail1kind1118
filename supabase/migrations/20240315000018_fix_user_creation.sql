-- Drop existing user creation trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user CASCADE;

-- Create enhanced user creation function with better error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    default_avatar TEXT;
BEGIN
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

    -- Insert new user into public.users table
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

    -- Update auth.users metadata
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
    -- Log error details
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RAISE LOG 'Error detail: %', SQLSTATE;
    -- Return NEW to allow auth user creation even if profile creation fails
    RETURN NEW;
END;
$$;

-- Recreate trigger with enhanced permissions
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticator;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticator;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticator;

-- Ensure public.users table has proper permissions
GRANT ALL ON public.users TO authenticator;
GRANT ALL ON public.users TO service_role;

-- Add error logging table for debugging
CREATE TABLE IF NOT EXISTS user_creation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    error_message TEXT,
    error_detail TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to log user creation errors
CREATE OR REPLACE FUNCTION log_user_creation_error(
    p_user_id UUID,
    p_error_message TEXT,
    p_error_detail TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO user_creation_logs (user_id, error_message, error_detail)
    VALUES (p_user_id, p_error_message, p_error_detail);
END;
$$;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_user_creation_logs_user_id 
    ON user_creation_logs(user_id);

-- Verify existing users and fix any missing entries
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
)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)),
    COALESCE(
        au.raw_user_meta_data->>'avatar_url',
        'https://ui-avatars.com/api/?name=' || split_part(au.email, '@', 1) || '&background=random'
    ),
    1000,
    'authenticated',
    au.email_confirmed_at IS NOT NULL,
    au.created_at,
    au.created_at,
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
        'timezone', 'UTC',
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
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM public.users pu WHERE pu.id = au.id
)
ON CONFLICT (id) DO NOTHING;