-- Drop existing triggers
DROP TRIGGER IF EXISTS handle_post_creation_trigger ON posts;
DROP TRIGGER IF EXISTS handle_event_creation_trigger ON events;
DROP TRIGGER IF EXISTS handle_transaction_trigger ON transactions;
DROP TRIGGER IF EXISTS update_user_stats_trigger ON users;

-- Function to handle post creation
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

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to handle event creation
CREATE OR REPLACE FUNCTION handle_event_creation()
RETURNS TRIGGER AS $$
BEGIN
    -- Initialize event stats
    NEW.stats = jsonb_build_object(
        'registeredCount', 0,
        'waitlistCount', 0,
        'attendedCount', 0,
        'rating', null,
        'feedback', jsonb_build_array(),
        'lastUpdated', NOW()
    );

    -- Update community stats if event belongs to a community
    IF NEW.community_id IS NOT NULL THEN
        UPDATE communities
        SET stats = jsonb_set(
            stats,
            '{totalEvents}',
            to_jsonb(COALESCE((stats->>'totalEvents')::integer, 0) + 1)
        )
        WHERE id = NEW.community_id;
    END IF;

    -- Add organizer as first attendee
    INSERT INTO event_attendees (
        event_id,
        user_id,
        status,
        role,
        joined_at
    ) VALUES (
        NEW.id,
        NEW.organizer_id,
        'confirmed',
        'organizer',
        NOW()
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update user stats
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update last active timestamp
    NEW.last_active = NOW();
    
    -- Initialize stats if null
    IF NEW.stats IS NULL THEN
        NEW.stats = jsonb_build_object(
            'monthlyPoints', 0,
            'quarterlyPoints', 0,
            'yearlyPoints', 0,
            'totalEarned', 0,
            'totalSpent', 0,
            'lastUpdated', NOW(),
            'asksCompleted', 0,
            'offersCompleted', 0,
            'responseRate', 100,
            'averageRating', 0,
            'totalRatings', 0,
            'reputation', 0
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to validate and handle transactions
CREATE OR REPLACE FUNCTION handle_transaction()
RETURNS TRIGGER AS $$
BEGIN
    -- Verify sender has enough points
    IF NEW.sender_id IS NOT NULL AND NEW.type IN ('spent', 'transfer') THEN
        IF (SELECT ki_points FROM users WHERE id = NEW.sender_id) < NEW.amount THEN
            RAISE EXCEPTION 'Insufficient Ki points';
        END IF;
    END IF;

    -- Update sender's points
    IF NEW.sender_id IS NOT NULL AND NEW.status = 'completed' THEN
        UPDATE users 
        SET 
            ki_points = ki_points - NEW.amount,
            stats = jsonb_set(
                stats,
                '{totalSpent}',
                to_jsonb(COALESCE((stats->>'totalSpent')::integer, 0) + NEW.amount)
            )
        WHERE id = NEW.sender_id;
    END IF;

    -- Update recipient's points
    IF NEW.recipient_id IS NOT NULL AND NEW.status = 'completed' THEN
        UPDATE users 
        SET 
            ki_points = ki_points + NEW.amount,
            stats = jsonb_set(
                stats,
                '{totalEarned}',
                to_jsonb(COALESCE((stats->>'totalEarned')::integer, 0) + NEW.amount)
            )
        WHERE id = NEW.recipient_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER handle_post_creation_trigger
    BEFORE INSERT ON posts
    FOR EACH ROW
    EXECUTE FUNCTION handle_post_creation();

CREATE TRIGGER handle_event_creation_trigger
    BEFORE INSERT ON events
    FOR EACH ROW
    EXECUTE FUNCTION handle_event_creation();

CREATE TRIGGER handle_transaction_trigger
    BEFORE INSERT ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION handle_transaction();

CREATE TRIGGER update_user_stats_trigger
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_user_stats();