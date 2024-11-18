-- Add event relationship to posts
ALTER TABLE posts 
ADD COLUMN event_id UUID REFERENCES events(id) ON DELETE SET NULL;

-- Add index for better performance
CREATE INDEX idx_posts_event ON posts(event_id);

-- Update RLS policy for posts to include event visibility
DROP POLICY IF EXISTS "Anyone can view posts" ON posts;
CREATE POLICY "Anyone can view posts"
    ON posts FOR SELECT
    TO authenticated
    USING (
        author_id = auth.uid() OR
        (
            (community_id IS NULL AND event_id IS NULL) OR
            (
                community_id IS NOT NULL AND
                EXISTS (
                    SELECT 1 FROM community_members
                    WHERE community_id = posts.community_id
                    AND user_id = auth.uid()
                    AND status = 'approved'
                )
            ) OR
            (
                event_id IS NOT NULL AND
                EXISTS (
                    SELECT 1 FROM event_attendees
                    WHERE event_id = posts.event_id
                    AND user_id = auth.uid()
                    AND status = 'confirmed'
                )
            )
        )
    );

-- Update post creation trigger to handle event stats
CREATE OR REPLACE FUNCTION handle_post_creation()
RETURNS TRIGGER AS $$
BEGIN
    -- Initialize post stats
    NEW.stats = jsonb_build_object(
        'views', 0,
        'interested', 0,
        'responses', 0,
        'lastActivity', NOW(),
        'averageResponseTime', null,
        'completionRate', null
    );

    -- Update user stats
    UPDATE users
    SET stats = jsonb_set(
        stats,
        CASE NEW.type
            WHEN 'ask' THEN '{totalAsks}'
            WHEN 'offer' THEN '{totalOffers}'
        END,
        to_jsonb(COALESCE((stats->>CASE NEW.type 
            WHEN 'ask' THEN 'totalAsks' 
            WHEN 'offer' THEN 'totalOffers'
        END)::integer, 0) + 1)
    )
    WHERE id = NEW.author_id;

    -- Update community stats if post belongs to a community
    IF NEW.community_id IS NOT NULL THEN
        UPDATE communities
        SET stats = jsonb_set(
            jsonb_set(
                stats,
                '{totalPosts}',
                to_jsonb(COALESCE((stats->>'totalPosts')::integer, 0) + 1)
            ),
            '{totalKiPoints}',
            to_jsonb(COALESCE((stats->>'totalKiPoints')::integer, 0) + NEW.ki_points)
        )
        WHERE id = NEW.community_id;
    END IF;

    -- Update event stats if post belongs to an event
    IF NEW.event_id IS NOT NULL THEN
        UPDATE events
        SET stats = jsonb_set(
            stats,
            '{totalPosts}',
            to_jsonb(COALESCE((stats->>'totalPosts')::integer, 0) + 1)
        )
        WHERE id = NEW.event_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;