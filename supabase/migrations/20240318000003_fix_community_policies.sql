-- Drop existing problematic policies
DROP POLICY IF EXISTS "Community members access" ON community_members;
DROP POLICY IF EXISTS "Public communities are viewable by all" ON communities;

-- Create separate policies for different operations on community_members
CREATE POLICY "Users can view community members"
    ON community_members FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid() OR
        community_id IN (
            SELECT id FROM communities 
            WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can join public communities"
    ON community_members FOR INSERT
    TO authenticated
    WITH CHECK (
        user_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM communities
            WHERE id = community_id
            AND (settings->>'isPrivate')::boolean = false
        )
    );

CREATE POLICY "Community owners can manage members"
    ON community_members FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM communities
            WHERE id = community_id
            AND owner_id = auth.uid()
        )
    );

-- Update communities policies
CREATE POLICY "Public communities are viewable by all"
    ON communities FOR SELECT
    TO authenticated
    USING (
        (settings->>'isPrivate')::boolean = false OR
        owner_id = auth.uid() OR
        id IN (
            SELECT community_id FROM community_members
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create communities"
    ON communities FOR INSERT
    TO authenticated
    WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Community owners can update their communities"
    ON communities FOR UPDATE
    TO authenticated
    USING (owner_id = auth.uid())
    WITH CHECK (owner_id = auth.uid());

-- Add helper function for checking community membership
CREATE OR REPLACE FUNCTION is_community_member(community_id UUID, user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 FROM community_members cm
        WHERE cm.community_id = $1
        AND cm.user_id = $2
    ) OR EXISTS (
        SELECT 1 FROM communities c
        WHERE c.id = $1
        AND c.owner_id = $2
    );
$$;