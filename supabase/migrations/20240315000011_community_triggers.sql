-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS handle_community_creation_trigger ON communities;
DROP TRIGGER IF EXISTS handle_community_member_trigger ON community_members;

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

    -- Set initial member count
    NEW.member_count = 1;

    -- Initialize community stats
    NEW.stats = jsonb_build_object(
        'totalPosts', 0,
        'totalEvents', 0,
        'totalKiPoints', 0,
        'activeMembers', 1,
        'weeklyGrowth', 0,
        'monthlyGrowth', 0,
        'engagementRate', 0,
        'topContributors', jsonb_build_array()
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to handle community member changes
CREATE OR REPLACE FUNCTION handle_community_member()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'approved' THEN
        -- Increment member count for new approved member
        UPDATE communities
        SET 
            member_count = member_count + 1,
            stats = jsonb_set(
                stats,
                '{activeMembers}',
                to_jsonb(COALESCE((stats->>'activeMembers')::integer, 0) + 1)
            )
        WHERE id = NEW.community_id;
    ELSIF TG_OP = 'DELETE' AND OLD.status = 'approved' THEN
        -- Decrement member count when approved member is removed
        UPDATE communities
        SET 
            member_count = GREATEST(0, member_count - 1),
            stats = jsonb_set(
                stats,
                '{activeMembers}',
                to_jsonb(GREATEST(0, COALESCE((stats->>'activeMembers')::integer, 0) - 1))
            )
        WHERE id = OLD.community_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.status != 'approved' AND NEW.status = 'approved' THEN
        -- Increment member count when member is approved
        UPDATE communities
        SET 
            member_count = member_count + 1,
            stats = jsonb_set(
                stats,
                '{activeMembers}',
                to_jsonb(COALESCE((stats->>'activeMembers')::integer, 0) + 1)
            )
        WHERE id = NEW.community_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.status = 'approved' AND NEW.status != 'approved' THEN
        -- Decrement member count when member is unapproved
        UPDATE communities
        SET 
            member_count = GREATEST(0, member_count - 1),
            stats = jsonb_set(
                stats,
                '{activeMembers}',
                to_jsonb(GREATEST(0, COALESCE((stats->>'activeMembers')::integer, 0) - 1))
            )
        WHERE id = NEW.community_id;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER handle_community_creation_trigger
    BEFORE INSERT ON communities
    FOR EACH ROW
    EXECUTE FUNCTION handle_community_creation();

CREATE TRIGGER handle_community_member_trigger
    AFTER INSERT OR UPDATE OR DELETE ON community_members
    FOR EACH ROW
    EXECUTE FUNCTION handle_community_member();