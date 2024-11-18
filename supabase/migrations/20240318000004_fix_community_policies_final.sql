-- Drop all existing community-related policies to start fresh
DROP POLICY IF EXISTS "Community members access" ON community_members;
DROP POLICY IF EXISTS "Users can view community members" ON community_members;
DROP POLICY IF EXISTS "Users can join public communities" ON community_members;
DROP POLICY IF EXISTS "Community owners can manage members" ON community_members;
DROP POLICY IF EXISTS "Public communities are viewable by all" ON communities;
DROP POLICY IF EXISTS "Users can create communities" ON communities;
DROP POLICY IF EXISTS "Community owners can update their communities" ON communities;

-- Create simplified, non-recursive community member policies
CREATE POLICY "View community members"
    ON community_members FOR SELECT
    TO authenticated
    USING (
        -- Users can view members of communities they own
        EXISTS (
            SELECT 1 FROM communities
            WHERE id = community_id
            AND owner_id = auth.uid()
        )
        OR
        -- Users can view members of communities they belong to
        user_id = auth.uid()
        OR
        -- Users can view members of public communities
        EXISTS (
            SELECT 1 FROM communities
            WHERE id = community_id
            AND (settings->>'isPrivate')::boolean = false
        )
    );

CREATE POLICY "Join community"
    ON community_members FOR INSERT
    TO authenticated
    WITH CHECK (
        user_id = auth.uid()
        AND
        EXISTS (
            SELECT 1 FROM communities
            WHERE id = community_id
            AND (
                (settings->>'isPrivate')::boolean = false
                OR
                owner_id = auth.uid()
            )
        )
    );

CREATE POLICY "Manage community members"
    ON community_members FOR DELETE
    TO authenticated
    USING (
        -- Community owners can remove members
        EXISTS (
            SELECT 1 FROM communities
            WHERE id = community_id
            AND owner_id = auth.uid()
        )
        OR
        -- Users can remove themselves
        user_id = auth.uid()
    );

-- Create simplified community policies
CREATE POLICY "View communities"
    ON communities FOR SELECT
    TO authenticated
    USING (
        -- Public communities
        (settings->>'isPrivate')::boolean = false
        OR
        -- Communities owned by the user
        owner_id = auth.uid()
        OR
        -- Communities where user is a member
        EXISTS (
            SELECT 1 FROM community_members
            WHERE community_id = id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Create communities"
    ON communities FOR INSERT
    TO authenticated
    WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Update communities"
    ON communities FOR UPDATE
    TO authenticated
    USING (owner_id = auth.uid())
    WITH CHECK (owner_id = auth.uid());

-- Helper function for checking membership (without recursion)
CREATE OR REPLACE FUNCTION is_community_member(community_id UUID, user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM community_members cm
        WHERE cm.community_id = $1
        AND cm.user_id = $2
    )
    OR
    EXISTS (
        SELECT 1 FROM communities c
        WHERE c.id = $1
        AND c.owner_id = $2
    );
$$;