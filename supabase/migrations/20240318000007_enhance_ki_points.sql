-- Add visibility and context columns to posts
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS contexts JSONB DEFAULT '{
    "community_ids": [],
    "event_ids": [],
    "profile_ids": []
}'::jsonb,
ADD COLUMN IF NOT EXISTS visibility_rules JSONB DEFAULT '{
    "show_in_feed": true,
    "show_in_profile": true,
    "show_in_search": true,
    "allowed_roles": ["authenticated"],
    "required_ki_points": 0
}'::jsonb;

-- Create a materialized view for post visibility
CREATE MATERIALIZED VIEW post_visibility AS
SELECT 
    p.id,
    p.title,
    p.description,
    p.type,
    p.ki_points,
    p.author_id,
    p.community_id,
    p.event_id,
    p.status,
    p.created_at,
    p.contexts,
    p.visibility_rules,
    EXISTS (
        SELECT 1 FROM community_members cm
        WHERE cm.community_id = p.community_id
        AND cm.user_id = p.author_id
        AND cm.status = 'approved'
    ) as is_community_member,
    EXISTS (
        SELECT 1 FROM event_attendees ea
        WHERE ea.event_id = p.event_id
        AND ea.user_id = p.author_id
        AND ea.status = 'confirmed'
    ) as is_event_attendee
FROM posts p;

-- Create index for better query performance
CREATE UNIQUE INDEX idx_post_visibility_id ON post_visibility(id);
CREATE INDEX idx_post_visibility_community ON post_visibility(community_id) WHERE community_id IS NOT NULL;
CREATE INDEX idx_post_visibility_event ON post_visibility(event_id) WHERE event_id IS NOT NULL;

-- Create function to refresh post visibility
CREATE OR REPLACE FUNCTION refresh_post_visibility()
RETURNS TRIGGER AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY post_visibility;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to refresh post visibility
CREATE TRIGGER refresh_post_visibility_on_post_change
    AFTER INSERT OR UPDATE OR DELETE ON posts
    FOR EACH STATEMENT
    EXECUTE FUNCTION refresh_post_visibility();

CREATE TRIGGER refresh_post_visibility_on_member_change
    AFTER INSERT OR UPDATE OR DELETE ON community_members
    FOR EACH STATEMENT
    EXECUTE FUNCTION refresh_post_visibility();

CREATE TRIGGER refresh_post_visibility_on_attendee_change
    AFTER INSERT OR UPDATE OR DELETE ON event_attendees
    FOR EACH STATEMENT
    EXECUTE FUNCTION refresh_post_visibility();

-- Create function to validate ki points for post creation
CREATE OR REPLACE FUNCTION validate_post_ki_points()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if user has enough points
    IF NOT EXISTS (
        SELECT 1 FROM users
        WHERE id = NEW.author_id
        AND ki_points >= NEW.ki_points
    ) THEN
        RAISE EXCEPTION 'Insufficient Ki points';
    END IF;

    -- Check minimum points based on type
    IF NEW.type = 'ask' AND NEW.ki_points < 100 THEN
        RAISE EXCEPTION 'Minimum 100 Ki points required for asks';
    END IF;

    IF NEW.type = 'offer' AND NEW.ki_points < 50 THEN
        RAISE EXCEPTION 'Minimum 50 Ki points required for offers';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for ki points validation
CREATE TRIGGER validate_post_ki_points_trigger
    BEFORE INSERT OR UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION validate_post_ki_points();

-- Create function to handle post completion and ki points transfer
CREATE OR REPLACE FUNCTION handle_post_completion()
RETURNS TRIGGER AS $$
DECLARE
    transaction_id UUID;
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        -- Create transaction record
        INSERT INTO transactions (
            sender_id,
            recipient_id,
            amount,
            type,
            status,
            metadata
        ) VALUES (
            CASE 
                WHEN NEW.type = 'ask' THEN NEW.author_id
                ELSE (SELECT user_id FROM post_responses WHERE post_id = NEW.id AND status = 'accepted' LIMIT 1)
            END,
            CASE 
                WHEN NEW.type = 'ask' THEN (SELECT user_id FROM post_responses WHERE post_id = NEW.id AND status = 'accepted' LIMIT 1)
                ELSE NEW.author_id
            END,
            NEW.ki_points,
            NEW.type,
            'completed',
            jsonb_build_object(
                'post_id', NEW.id,
                'completion_time', CURRENT_TIMESTAMP
            )
        ) RETURNING id INTO transaction_id;

        -- Update user stats
        UPDATE users
        SET 
            stats = jsonb_set(
                stats,
                '{' || CASE NEW.type 
                    WHEN 'ask' THEN 'asksCompleted'
                    ELSE 'offersCompleted'
                END || '}',
                to_jsonb(COALESCE((stats->>CASE NEW.type 
                    WHEN 'ask' THEN 'asksCompleted'
                    ELSE 'offersCompleted'
                END)::integer, 0) + 1)
            )
        WHERE id = NEW.author_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for post completion
CREATE TRIGGER handle_post_completion_trigger
    AFTER UPDATE ON posts
    FOR EACH ROW
    WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
    EXECUTE FUNCTION handle_post_completion();

-- Update RLS policies
CREATE POLICY "View posts based on visibility rules"
    ON posts FOR SELECT
    TO authenticated
    USING (
        (visibility_rules->>'show_in_feed')::boolean
        OR author_id = auth.uid()
        OR (
            community_id IS NOT NULL
            AND EXISTS (
                SELECT 1 FROM community_members
                WHERE community_id = posts.community_id
                AND user_id = auth.uid()
                AND status = 'approved'
            )
        )
        OR (
            event_id IS NOT NULL
            AND EXISTS (
                SELECT 1 FROM event_attendees
                WHERE event_id = posts.event_id
                AND user_id = auth.uid()
                AND status = 'confirmed'
            )
        )
    );