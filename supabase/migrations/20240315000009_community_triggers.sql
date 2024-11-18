-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS handle_community_creation_trigger ON communities;
DROP TRIGGER IF EXISTS handle_community_member_trigger ON community_members;
DROP TRIGGER IF EXISTS update_community_stats_trigger ON posts;

-- Function to handle new community creation
CREATE OR REPLACE FUNCTION handle_community_creation()
RETURNS TRIGGER AS $$
BEGIN
    -- Add creator as admin member
    INSERT INTO community_members (
        community_id,
        user_id,
        role,
        status,
        joined_at
    ) VALUES (
        NEW.id,
        NEW.owner_id,
        'admin',
        'approved',
        NOW()
    );

    -- Initialize community stats
    UPDATE communities
    SET stats = jsonb_build_object(
        'totalPosts', 0,
        'totalEvents', 0,
        'totalKiPoints', 0,
        'activeMembers', 1,
        'weeklyGrowth', 0,
        'monthlyGrowth', 0,
        'engagementRate', 0,
        'topContributors', '[]'::jsonb
    )
    WHERE id = NEW.id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update community stats when posts are created/updated
CREATE OR REPLACE FUNCTION update_community_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Update post count and total Ki points
        UPDATE communities
        SET stats = stats || jsonb_build_object(
            'totalPosts', COALESCE((stats->>'totalPosts')::integer, 0) + 1,
            'totalKiPoints', COALESCE((stats->>'totalKiPoints')::integer, 0) + NEW.ki_points
        )
        WHERE id = NEW.community_id;
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrease post count and total Ki points
        UPDATE communities
        SET stats = stats || jsonb_build_object(
            'totalPosts', GREATEST(0, COALESCE((stats->>'totalPosts')::integer, 0) - 1),
            'totalKiPoints', GREATEST(0, COALESCE((stats->>'totalKiPoints')::integer, 0) - OLD.ki_points)
        )
        WHERE id = OLD.community_id;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update community member stats
CREATE OR REPLACE FUNCTION update_community_member_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'approved' THEN
        -- Update member count and stats for new approved member
        UPDATE communities
        SET member_count = member_count + 1,
            stats = stats || jsonb_build_object(
                'activeMembers', COALESCE((stats->>'activeMembers')::integer, 0) + 1
            )
        WHERE id = NEW.community_id;
    ELSIF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND OLD.status = 'approved' AND NEW.status != 'approved') THEN
        -- Decrease member count when member is removed or status changes from approved
        UPDATE communities
        SET member_count = GREATEST(0, member_count - 1),
            stats = stats || jsonb_build_object(
                'activeMembers', GREATEST(0, COALESCE((stats->>'activeMembers')::integer, 0) - 1)
            )
        WHERE id = COALESCE(OLD.community_id, NEW.community_id);
    END IF;

    -- Update growth metrics monthly
    IF TG_OP = 'INSERT' AND NEW.status = 'approved' THEN
        UPDATE communities
        SET stats = stats || jsonb_build_object(
            'monthlyGrowth', COALESCE((stats->>'monthlyGrowth')::integer, 0) + 1
        )
        WHERE id = NEW.community_id
        AND NEW.joined_at >= date_trunc('month', CURRENT_DATE);
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER handle_community_creation_trigger
    AFTER INSERT ON communities
    FOR EACH ROW
    EXECUTE FUNCTION handle_community_creation();

CREATE TRIGGER update_community_stats_trigger
    AFTER INSERT OR DELETE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_community_stats();

CREATE TRIGGER handle_community_member_trigger
    AFTER INSERT OR UPDATE OR DELETE ON community_members
    FOR EACH ROW
    EXECUTE FUNCTION update_community_member_stats();