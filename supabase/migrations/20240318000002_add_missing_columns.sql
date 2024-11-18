-- Add missing columns to posts table
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Add missing columns to communities table
ALTER TABLE communities
ADD COLUMN IF NOT EXISTS guidelines TEXT,
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Create explicit foreign key relationships with unique names
ALTER TABLE posts
DROP CONSTRAINT IF EXISTS posts_author_id_fkey,
ADD CONSTRAINT posts_author_id_user_fkey 
    FOREIGN KEY (author_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE;

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_communities_category ON communities(category);
CREATE INDEX IF NOT EXISTS idx_posts_tags ON posts USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_communities_tags ON communities USING gin(tags);

-- Update RLS policies for new columns
DROP POLICY IF EXISTS "Users can update their own posts" ON posts;
CREATE POLICY "Users can update their own posts"
    ON posts FOR UPDATE
    TO authenticated
    USING (author_id = auth.uid())
    WITH CHECK (author_id = auth.uid());

-- Add constraints for categories
ALTER TABLE posts
ADD CONSTRAINT posts_category_check 
    CHECK (category IN ('general', 'education', 'technology', 'health', 'business', 'arts', 'other'));

ALTER TABLE communities
ADD CONSTRAINT communities_category_check 
    CHECK (category IN ('general', 'education', 'technology', 'health', 'business', 'arts', 'other'));

-- Update community members policy to fix recursion
DROP POLICY IF EXISTS "Community members access" ON community_members;
CREATE POLICY "Community members access"
    ON community_members FOR ALL
    TO authenticated
    USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM communities c
            WHERE c.id = community_members.community_id
            AND c.owner_id = auth.uid()
        )
    );