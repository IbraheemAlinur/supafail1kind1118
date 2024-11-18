-- Create proper Supabase roles and permissions
DO $$ 
BEGIN
    -- Create service_role for background tasks if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
        CREATE ROLE service_role NOLOGIN;
    END IF;
END $$;

-- Grant permissions to authenticator role (the main Supabase role)
GRANT USAGE ON SCHEMA public TO authenticator;

-- Grant basic permissions
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticator;

-- Grant specific table permissions
DO $$ 
BEGIN
    -- Ensure tables exist before granting permissions
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
        GRANT INSERT, UPDATE, DELETE ON TABLE public.users TO authenticator;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'posts') THEN
        GRANT INSERT, UPDATE, DELETE ON TABLE public.posts TO authenticator;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'post_responses') THEN
        GRANT INSERT, UPDATE, DELETE ON TABLE public.post_responses TO authenticator;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'post_interested_users') THEN
        GRANT INSERT, UPDATE, DELETE ON TABLE public.post_interested_users TO authenticator;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'community_members') THEN
        GRANT INSERT, UPDATE ON TABLE public.community_members TO authenticator;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'events') THEN
        GRANT INSERT ON TABLE public.events TO authenticator;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'event_attendees') THEN
        GRANT INSERT ON TABLE public.event_attendees TO authenticator;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'messages') THEN
        GRANT INSERT ON TABLE public.messages TO authenticator;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'transactions') THEN
        GRANT INSERT ON TABLE public.transactions TO authenticator;
    END IF;
END $$;

-- Grant sequence usage
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticator;

-- Create admin management functions
CREATE OR REPLACE FUNCTION make_user_admin(user_id UUID)
RETURNS void AS $$
BEGIN
    -- Update user role in public.users table
    UPDATE public.users
    SET role = 'admin'
    WHERE id = user_id;

    -- Update user's metadata in auth.users
    UPDATE auth.users
    SET raw_app_meta_data = raw_app_meta_data || 
        jsonb_build_object('role', 'admin')
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION remove_user_admin(user_id UUID)
RETURNS void AS $$
BEGIN
    -- Update user role in public.users table
    UPDATE public.users
    SET role = 'user'
    WHERE id = user_id;

    -- Update user's metadata in auth.users
    UPDATE auth.users
    SET raw_app_meta_data = raw_app_meta_data || 
        jsonb_build_object('role', 'user')
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create admin check function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid()
        AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create role check function
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT role 
        FROM public.users 
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policies to use proper role checks
DO $$ 
BEGIN
    -- Only create policies if tables exist
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
        -- Example policy using the new role system
        DROP POLICY IF EXISTS "Admins can view all data" ON public.users;
        CREATE POLICY "Admins can view all data"
            ON public.users
            FOR ALL
            TO authenticator
            USING (get_user_role() = 'admin')
            WITH CHECK (get_user_role() = 'admin');
    END IF;
END $$;