-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Fix jsonb functions for post creation
CREATE OR REPLACE FUNCTION handle_post_creation()
RETURNS TRIGGER AS $$
BEGIN
    -- Initialize post stats using jsonb_build_object instead of jsonb_set
    NEW.stats = jsonb_build_object(
        'views', 0,
        'interested', 0,
        'responses', 0,
        'lastActivity', CURRENT_TIMESTAMP,
        'averageResponseTime', null,
        'completionRate', null
    );

    -- Update user stats
    UPDATE users
    SET stats = jsonb_build_object(
        'monthlyPoints', COALESCE((stats->>'monthlyPoints')::integer, 0),
        'quarterlyPoints', COALESCE((stats->>'quarterlyPoints')::integer, 0),
        'yearlyPoints', COALESCE((stats->>'yearlyPoints')::integer, 0),
        'totalEarned', COALESCE((stats->>'totalEarned')::integer, 0),
        'totalSpent', COALESCE((stats->>'totalSpent')::integer, 0),
        'lastUpdated', CURRENT_TIMESTAMP,
        'asksCompleted', COALESCE((stats->>'asksCompleted')::integer, 0),
        'offersCompleted', COALESCE((stats->>'offersCompleted')::integer, 0),
        'responseRate', COALESCE((stats->>'responseRate')::integer, 100),
        'averageRating', COALESCE((stats->>'averageRating')::float, 0),
        'totalRatings', COALESCE((stats->>'totalRatings')::integer, 0),
        'reputation', COALESCE((stats->>'reputation')::integer, 0),
        CASE NEW.type
            WHEN 'ask' THEN 'totalAsks'
            WHEN 'offer' THEN 'totalOffers'
        END,
        COALESCE((stats->>CASE NEW.type 
            WHEN 'ask' THEN 'totalAsks' 
            WHEN 'offer' THEN 'totalOffers'
        END)::integer, 0) + 1
    )
    WHERE id = NEW.author_id;

    -- Update community stats if post belongs to a community
    IF NEW.community_id IS NOT NULL THEN
        UPDATE communities
        SET stats = jsonb_build_object(
            'totalPosts', COALESCE((stats->>'totalPosts')::integer, 0) + 1,
            'totalEvents', COALESCE((stats->>'totalEvents')::integer, 0),
            'totalKiPoints', COALESCE((stats->>'totalKiPoints')::integer, 0) + NEW.ki_points,
            'activeMembers', COALESCE((stats->>'activeMembers')::integer, 0),
            'weeklyGrowth', COALESCE((stats->>'weeklyGrowth')::integer, 0),
            'monthlyGrowth', COALESCE((stats->>'monthlyGrowth')::integer, 0),
            'engagementRate', COALESCE((stats->>'engagementRate')::float, 0),
            'topContributors', COALESCE(stats->'topContributors', '[]'::jsonb)
        )
        WHERE id = NEW.community_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
DROP TRIGGER IF EXISTS handle_post_creation_trigger ON posts;
CREATE TRIGGER handle_post_creation_trigger
    BEFORE INSERT ON posts
    FOR EACH ROW
    EXECUTE FUNCTION handle_post_creation();

-- Helper function to safely update jsonb fields
CREATE OR REPLACE FUNCTION safe_jsonb_set(
    target jsonb,
    path text[],
    value jsonb,
    create_missing boolean DEFAULT true
) RETURNS jsonb AS $$
BEGIN
    IF target IS NULL THEN
        target = '{}'::jsonb;
    END IF;
    RETURN jsonb_set(target, path, value, create_missing);
EXCEPTION
    WHEN OTHERS THEN
        RETURN target || jsonb_build_object(path[array_length(path,1)], value);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Update existing records to ensure valid jsonb
UPDATE posts SET stats = '{"views": 0, "interested": 0, "responses": 0}'::jsonb 
WHERE stats IS NULL OR stats = '{}'::jsonb;

UPDATE users SET stats = jsonb_build_object(
    'monthlyPoints', 0,
    'quarterlyPoints', 0,
    'yearlyPoints', 0,
    'totalEarned', 0,
    'totalSpent', 0,
    'lastUpdated', CURRENT_TIMESTAMP,
    'asksCompleted', 0,
    'offersCompleted', 0,
    'responseRate', 100,
    'averageRating', 0,
    'totalRatings', 0,
    'reputation', 0
) WHERE stats IS NULL OR stats = '{}'::jsonb;

UPDATE communities SET stats = jsonb_build_object(
    'totalPosts', 0,
    'totalEvents', 0,
    'totalKiPoints', 0,
    'activeMembers', 0,
    'weeklyGrowth', 0,
    'monthlyGrowth', 0,
    'engagementRate', 0,
    'topContributors', '[]'::jsonb
) WHERE stats IS NULL OR stats = '{}'::jsonb;