-- Add missing stats column to posts
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS stats JSONB DEFAULT '{
    "views": 0,
    "responses": 0,
    "interested": 0,
    "completed": false,
    "rating": 0
}'::jsonb;

-- Create events table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    organizer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    location JSONB,
    capacity INTEGER,
    status TEXT NOT NULL DEFAULT 'upcoming',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    settings JSONB DEFAULT '{
        "isPrivate": false,
        "requiresRegistration": false,
        "allowsGuests": true
    }'::jsonb,
    stats JSONB DEFAULT '{
        "registered": 0,
        "attended": 0,
        "rating": 0
    }'::jsonb,
    CONSTRAINT events_status_check CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
    CONSTRAINT events_capacity_check CHECK (capacity > 0),
    CONSTRAINT events_time_check CHECK (end_time > start_time)
);

-- Create event_participants table
CREATE TABLE IF NOT EXISTS event_participants (
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'registered',
    registered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    attended BOOLEAN DEFAULT false,
    PRIMARY KEY (event_id, user_id),
    CONSTRAINT event_participants_status_check CHECK (status IN ('registered', 'waitlisted', 'cancelled'))
);

-- Add indexes for events
CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_community_id ON events(community_id);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);

-- Enable RLS on new tables
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;

-- Create policies for events
CREATE POLICY "Users can view public events"
    ON events FOR SELECT
    TO authenticated
    USING (
        (settings->>'isPrivate')::boolean = false
        OR organizer_id = auth.uid()
        OR community_id IN (
            SELECT community_id FROM community_members
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create events"
    ON events FOR INSERT
    TO authenticated
    WITH CHECK (
        organizer_id = auth.uid()
        AND (
            community_id IS NULL
            OR EXISTS (
                SELECT 1 FROM community_members
                WHERE community_id = events.community_id
                AND user_id = auth.uid()
                AND role IN ('admin', 'moderator')
            )
        )
    );

CREATE POLICY "Organizers can update events"
    ON events FOR UPDATE
    TO authenticated
    USING (organizer_id = auth.uid())
    WITH CHECK (organizer_id = auth.uid());

-- Create policies for event participants
CREATE POLICY "Users can view event participants"
    ON event_participants FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM events
            WHERE id = event_id
            AND (
                organizer_id = auth.uid()
                OR (settings->>'isPrivate')::boolean = false
            )
        )
    );

CREATE POLICY "Users can register for events"
    ON event_participants FOR INSERT
    TO authenticated
    WITH CHECK (
        user_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM events
            WHERE id = event_id
            AND status = 'upcoming'
            AND (
                (settings->>'isPrivate')::boolean = false
                OR organizer_id = auth.uid()
                OR community_id IN (
                    SELECT community_id FROM community_members
                    WHERE user_id = auth.uid()
                )
            )
        )
    );

-- Fix posts foreign key relationships
ALTER TABLE posts
DROP CONSTRAINT IF EXISTS posts_author_id_fkey,
DROP CONSTRAINT IF EXISTS posts_author_id_user_fkey,
ADD CONSTRAINT posts_author_id_fkey 
    FOREIGN KEY (author_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE;

-- Update community_members policies to prevent recursion
DROP POLICY IF EXISTS "View community members" ON community_members;
CREATE POLICY "View community members"
    ON community_members FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM communities
            WHERE id = community_id
            AND owner_id = auth.uid()
        )
    );

-- Grant permissions for new tables
GRANT ALL ON events TO authenticated;
GRANT ALL ON event_participants TO authenticated;