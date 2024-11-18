-- Function to promote user to admin
CREATE OR REPLACE FUNCTION promote_to_admin(user_email TEXT)
RETURNS void AS $$
BEGIN
    -- Update user role in public.users table
    UPDATE public.users
    SET role = 'admin'
    WHERE email = user_email;

    -- Grant admin role to user
    EXECUTE format('GRANT admin TO %I', user_email);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to revoke admin privileges
CREATE OR REPLACE FUNCTION revoke_admin(user_email TEXT)
RETURNS void AS $$
BEGIN
    -- Update user role in public.users table
    UPDATE public.users
    SET role = 'authenticated'
    WHERE email = user_email;

    -- Revoke admin role from user
    EXECUTE format('REVOKE admin FROM %I', user_email);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create policy to allow admins to promote/revoke other admins
CREATE POLICY "Only admins can manage admin roles"
    ON public.users
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );