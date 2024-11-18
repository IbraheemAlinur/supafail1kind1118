-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_post_stats_trigger ON posts;
DROP TRIGGER IF EXISTS update_user_points_trigger ON transactions;
DROP TRIGGER IF EXISTS handle_post_transaction_trigger ON transactions;
DROP TRIGGER IF EXISTS update_community_stats_trigger ON community_members;

-- Function to update post statistics
CREATE OR REPLACE FUNCTION update_post_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update response count
    IF TG_OP = 'INSERT' AND TG_TABLE_NAME = 'post_responses' THEN
        UPDATE posts 
        SET response_count = response_count + 1,
            stats = stats || jsonb_build_object(
                'responses', COALESCE((stats->>'responses')::integer, 0) + 1,
                'lastActivity', CURRENT_TIMESTAMP
            )
        WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' AND TG_TABLE_NAME = 'post_responses' THEN
        UPDATE posts 
        SET response_count = response_count - 1,
            stats = stats || jsonb_build_object(
                'responses', GREATEST(0, COALESCE((stats->>'responses')::integer, 0) - 1),
                'lastActivity', CURRENT_TIMESTAMP
            )
        WHERE id = OLD.post_id;
    END IF;

    -- Update last activity timestamp
    UPDATE posts
    SET updated_at = NOW()
    WHERE id = COALESCE(NEW.post_id, OLD.post_id);

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to handle Ki points transactions
CREATE OR REPLACE FUNCTION handle_transaction()
RETURNS TRIGGER AS $$
BEGIN
    -- Verify sender has enough points for transaction
    IF NEW.sender_id IS NOT NULL AND NEW.type IN ('spent', 'transfer') THEN
        IF (SELECT ki_points FROM users WHERE id = NEW.sender_id) < NEW.amount THEN
            RAISE EXCEPTION 'Insufficient Ki points';
        END IF;
    END IF;

    -- Update sender's points
    IF NEW.sender_id IS NOT NULL AND NEW.status = 'completed' THEN
        UPDATE users 
        SET ki_points = ki_points - NEW.amount,
            stats = stats || jsonb_build_object(
                'totalSpent', COALESCE((stats->>'totalSpent')::integer, 0) + NEW.amount
            )
        WHERE id = NEW.sender_id;
    END IF;

    -- Update recipient's points
    IF NEW.recipient_id IS NOT NULL AND NEW.status = 'completed' THEN
        UPDATE users 
        SET ki_points = ki_points + NEW.amount,
            stats = stats || jsonb_build_object(
                'totalEarned', COALESCE((stats->>'totalEarned')::integer, 0) + NEW.amount
            )
        WHERE id = NEW.recipient_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update community statistics
CREATE OR REPLACE FUNCTION update_community_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE communities 
        SET member_count = member_count + 1,
            stats = stats || jsonb_build_object(
                'activeMembers', COALESCE((stats->>'activeMembers')::integer, 0) + 1
            )
        WHERE id = NEW.community_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE communities 
        SET member_count = member_count - 1,
            stats = stats || jsonb_build_object(
                'activeMembers', GREATEST(0, COALESCE((stats->>'activeMembers')::integer, 0) - 1)
            )
        WHERE id = OLD.community_id;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_post_stats_trigger
    AFTER INSERT OR DELETE ON post_responses
    FOR EACH ROW
    EXECUTE FUNCTION update_post_stats();

CREATE TRIGGER handle_transaction_trigger
    BEFORE INSERT ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION handle_transaction();

CREATE TRIGGER update_community_stats_trigger
    AFTER INSERT OR DELETE ON community_members
    FOR EACH ROW
    EXECUTE FUNCTION update_community_stats();

-- Add function to automatically set updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to all relevant tables
CREATE TRIGGER set_timestamp
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_timestamp
    BEFORE UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_timestamp
    BEFORE UPDATE ON communities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_timestamp
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_timestamp
    BEFORE UPDATE ON message_threads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();