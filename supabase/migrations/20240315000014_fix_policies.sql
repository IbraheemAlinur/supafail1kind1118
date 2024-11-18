-- Drop problematic policies first
DROP POLICY IF EXISTS "Members can view private communities" ON communities;
DROP POLICY IF EXISTS "Members can manage their own membership" ON community_members;
DROP POLICY IF EXISTS "Admins can manage members" ON community_members;

-- Fix community members policies to avoid recursion
CREATE POLICY "View community members"
    ON community_members
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM communities c
            WHERE c.id = community_id
            AND (
                c.visibility = 'public' OR
                c.visibility = 'unlisted' OR
                (c.visibility = 'private' AND community_id IN (
                    SELECT cm.community_id
                    FROM community_members cm
                    WHERE cm.user_id = auth.uid()
                    AND cm.status = 'approved'
                ))
            )
        )
    );

CREATE POLICY "Join public communities"
    ON community_members
    FOR INSERT
    TO authenticated
    WITH CHECK (
        user_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM communities c
            WHERE c.id = community_id
            AND c.visibility IN ('public', 'unlisted')
        )
    );

CREATE POLICY "Manage own membership"
    ON community_members
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Community admins can manage members"
    ON community_members
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM community_members cm
            WHERE cm.community_id = community_members.community_id
            AND cm.user_id = auth.uid()
            AND cm.role = 'admin'
            AND cm.status = 'approved'
        )
    );

-- Fix posts relationship issue
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_author_id_fkey;
ALTER TABLE posts ADD CONSTRAINT posts_author_id_fkey 
    FOREIGN KEY (author_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE;

-- Create explicit post relationships view
CREATE OR REPLACE VIEW user_posts AS
SELECT 
    p.*,
    u.name as author_name,
    u.avatar_url as author_avatar
FROM posts p
JOIN users u ON p.author_id = u.id;

-- Update posts policies to reference the correct relationships
CREATE POLICY "View public posts"
    ON posts
    FOR SELECT
    TO authenticated
    USING (
        visibility = 'public' OR
        author_id = auth.uid() OR
        (
            community_id IS NOT NULL AND
            EXISTS (
                SELECT 1 FROM community_members cm
                WHERE cm.community_id = posts.community_id
                AND cm.user_id = auth.uid()
                AND cm.status = 'approved'
            )
        )
    );

-- Function to safely check community membership
CREATE OR REPLACE FUNCTION is_community_member(community_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM community_members
        WHERE community_id = $1
        AND user_id = $2
        AND status = 'approved'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update community visibility policy
CREATE POLICY "Access community based on visibility"
    ON communities
    FOR SELECT
    TO authenticated
    USING (
        visibility IN ('public', 'unlisted') OR
        id IN (
            SELECT community_id
            FROM community_members
            WHERE user_id = auth.uid()
            AND status = 'approved'
        )
    );

-- Add indexes to improve query performance
CREATE INDEX IF NOT EXISTS idx_community_members_user_status 
    ON community_members(user_id, status);
CREATE INDEX IF NOT EXISTS idx_community_members_community_status 
    ON community_members(community_id, status);
CREATE INDEX IF NOT EXISTS idx_posts_visibility 
    ON posts(visibility);
CREATE INDEX IF NOT EXISTS idx_communities_visibility 
    ON communities(visibility);