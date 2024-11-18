-- Drop all existing policies first
DO $$ 
DECLARE
    _sql text;
BEGIN
    FOR _sql IN (
        SELECT format('DROP POLICY IF EXISTS %I ON %I;',
            pol.polname,
            c.relname)
        FROM pg_policy pol
        JOIN pg_class c ON c.oid = pol.polrelid
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public'
    ) LOOP
        EXECUTE _sql;
    END LOOP;
END $$;

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_interested_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Anyone can view users"
    ON users FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can update own profile"
    ON users FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Posts table policies
CREATE POLICY "Anyone can view posts"
    ON posts FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can create posts"
    ON posts FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = author_id AND
        auth.role() = 'authenticated'
    );

CREATE POLICY "Users can update own posts"
    ON posts FOR UPDATE
    TO authenticated
    USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own posts"
    ON posts FOR DELETE
    TO authenticated
    USING (auth.uid() = author_id);

-- Communities table policies
CREATE POLICY "Anyone can view public communities"
    ON communities FOR SELECT
    TO authenticated
    USING (visibility = 'public' OR visibility = 'unlisted');

CREATE POLICY "Members can view private communities"
    ON communities FOR SELECT
    TO authenticated
    USING (
        visibility = 'private' AND
        EXISTS (
            SELECT 1 FROM community_members
            WHERE community_id = communities.id
            AND user_id = auth.uid()
            AND status = 'approved'
        )
    );

CREATE POLICY "Authenticated users can create communities"
    ON communities FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = owner_id AND
        auth.role() = 'authenticated'
    );

CREATE POLICY "Owners can update communities"
    ON communities FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM community_members
            WHERE community_id = communities.id
            AND user_id = auth.uid()
            AND role = 'admin'
            AND status = 'approved'
        )
    );

-- Events table policies
CREATE POLICY "Anyone can view events"
    ON events FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can create events"
    ON events FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = organizer_id AND
        auth.role() = 'authenticated'
    );

CREATE POLICY "Organizers can update events"
    ON events FOR UPDATE
    TO authenticated
    USING (auth.uid() = organizer_id);

-- Message policies
CREATE POLICY "Users can view their messages"
    ON messages FOR SELECT
    TO authenticated
    USING (auth.uid() IN (sender_id, recipient_id));

CREATE POLICY "Authenticated users can send messages"
    ON messages FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = sender_id AND
        auth.role() = 'authenticated'
    );

-- Transaction policies
CREATE POLICY "Users can view their transactions"
    ON transactions FOR SELECT
    TO authenticated
    USING (auth.uid() IN (sender_id, recipient_id));

CREATE POLICY "Authenticated users can create transactions"
    ON transactions FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() IN (sender_id, recipient_id) AND
        auth.role() = 'authenticated'
    );

-- Community members policies
CREATE POLICY "Anyone can view community members"
    ON community_members FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can join communities"
    ON community_members FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = user_id AND
        auth.role() = 'authenticated'
    );

CREATE POLICY "Members can manage their own membership"
    ON community_members FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Admins can manage members"
    ON community_members FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM community_members
            WHERE community_id = community_members.community_id
            AND user_id = auth.uid()
            AND role = 'admin'
            AND status = 'approved'
        )
    );