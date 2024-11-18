-- Drop any existing triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user CASCADE;
DROP TRIGGER IF EXISTS on_user_profile_updated ON public.users;
DROP FUNCTION IF EXISTS sync_user_profile CASCADE;

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_avatar TEXT;
BEGIN
    -- Generate default avatar URL
    default_avatar := 'https://ui-avatars.com/api/?name=' || 
                     COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)) || 
                     '&background=random';

    -- Set the user's role to authenticated
    UPDATE auth.users 
    SET raw_app_meta_data = 
        COALESCE(raw_app_meta_data, '{}'::jsonb) || 
        jsonb_build_object('role', 'authenticated'),
        raw_user_meta_data = 
        COALESCE(raw_user_meta_data, '{}'::jsonb) || 
        jsonb_build_object('role', 'authenticated');

    -- Insert the new user into our public.users table
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
        1000, -- Starting Ki points
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
            'lastUpdated', NULL,
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

    -- Grant necessary database roles
    EXECUTE format(
        'GRANT authenticated TO %I',
        NEW.email
    );

    RETURN NEW;
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Error creating user: %', SQLERRM;
        RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to sync user profile updates
CREATE OR REPLACE FUNCTION sync_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- Update auth.users metadata when public.users is updated
    UPDATE auth.users
    SET raw_app_meta_data = 
        COALESCE(raw_app_meta_data, '{}'::jsonb) || 
        jsonb_build_object(
            'role', NEW.role,
            'ki_points', NEW.ki_points
        ),
        raw_user_meta_data = 
        COALESCE(raw_user_meta_data, '{}'::jsonb) || 
        jsonb_build_object(
            'name', NEW.name,
            'avatar_url', NEW.avatar_url,
            'role', NEW.role
        )
    WHERE id = NEW.id;
    
    RETURN NEW;
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Error syncing user profile: %', SQLERRM;
        RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Create trigger for profile sync
CREATE TRIGGER on_user_profile_updated
    AFTER UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION sync_user_profile();

-- Create default roles and grant permissions
DO $$ 
BEGIN
    -- Create authenticated role if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
        CREATE ROLE authenticated;
        
        -- Grant basic permissions
        GRANT USAGE ON SCHEMA public TO authenticated;
        
        -- Grant SELECT on all tables
        GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
        
        -- Grant INSERT, UPDATE, DELETE on specific tables with row-level security
        GRANT INSERT, UPDATE, DELETE ON TABLE public.users TO authenticated;
        GRANT INSERT, UPDATE, DELETE ON TABLE public.posts TO authenticated;
        GRANT INSERT, UPDATE, DELETE ON TABLE public.post_responses TO authenticated;
        GRANT INSERT, UPDATE, DELETE ON TABLE public.post_interested_users TO authenticated;
        GRANT INSERT, UPDATE ON TABLE public.community_members TO authenticated;
        GRANT INSERT ON TABLE public.events TO authenticated;
        GRANT INSERT ON TABLE public.event_attendees TO authenticated;
        GRANT INSERT ON TABLE public.messages TO authenticated;
        GRANT INSERT ON TABLE public.transactions TO authenticated;
        
        -- Grant USAGE on sequences
        GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
    END IF;

    -- Create admin role if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'admin') THEN
        CREATE ROLE admin;
        
        -- Grant full access to admin
        GRANT ALL ON ALL TABLES IN SCHEMA public TO admin;
        GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO admin;
        GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO admin;
        
        -- Additional admin-specific permissions
        GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO admin;
        GRANT admin TO authenticated; -- Admins also have authenticated permissions
    END IF;

    -- Create service_role for background jobs and system operations
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
        CREATE ROLE service_role;
        
        -- Grant necessary permissions for system operations
        GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
        GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
        GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;
    END IF;
END $$;

-- Create RLS policies for users table
CREATE POLICY "Users can view their own profile"
    ON public.users
    FOR SELECT
    TO authenticated
    USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
    ON public.users
    FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Allow admins to view and modify all users
CREATE POLICY "Admins can view all users"
    ON public.users
    FOR SELECT
    TO admin
    USING (true);

CREATE POLICY "Admins can modify all users"
    ON public.users
    FOR ALL
    TO admin
    USING (true)
    WITH CHECK (true);