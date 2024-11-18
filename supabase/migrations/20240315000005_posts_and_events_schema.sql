-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('ask', 'offer')),
    ki_points INTEGER NOT NULL CHECK (ki_points >= 0),
    author_id UUID REFERENCES users(id) ON DELETE CASCADE,
    community_id UUID REFERENCES communities(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed')),
    visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'unlisted')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    response_count INTEGER NOT NULL DEFAULT 0,
    stats JSONB DEFAULT '{
        "views": 0,
        "interested": 0,
        "responses": 0,
        "lastActivity": null,
        "averageResponseTime": null,
        "completionRate": null
    }'::jsonb,
    metadata JSONB DEFAULT '{
        "attachments": [],
        "requirements": [],
        "timeEstimate": null,
        "preferredSkills": [],
        "completionCriteria": []
    }'::jsonb
);

-- Create post_tags table
CREATE TABLE IF NOT EXISTS post_tags (
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    tag TEXT NOT NULL,
    PRIMARY KEY (post_id, tag)
);

-- Create post_responses table
CREATE TABLE IF NOT EXISTS post_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{
        "attachments": [],
        "rating": null,
        "feedback": null,
        "completionTime": null
    }'::jsonb
);

-- Create post_interested_users table
CREATE TABLE IF NOT EXISTS post_interested_users (
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (post_id, user_id)
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    cover_image TEXT,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    timezone TEXT NOT NULL DEFAULT 'UTC',
    type TEXT NOT NULL CHECK (type IN ('online', 'in_person')),
    location TEXT,
    meeting_link TEXT,
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    organizer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    community_id UUID REFERENCES communities(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    requires_approval BOOLEAN NOT NULL DEFAULT false,
    custom_url TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    stats JSONB DEFAULT '{
        "registeredCount": 0,
        "waitlistCount": 0,
        "attendedCount": 0,
        "rating": null,
        "feedback": [],
        "lastUpdated": null
    }'::jsonb,
    metadata JSONB DEFAULT '{
        "agenda": [],
        "sponsors": [],
        "requirements": [],
        "resources": [],
        "recording": null
    }'::jsonb
);

-- Create event_attendees table
CREATE TABLE IF NOT EXISTS event_attendees (
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected', 'cancelled', 'waitlist')),
    role TEXT NOT NULL DEFAULT 'attendee' CHECK (role IN ('attendee', 'speaker', 'organizer')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    message TEXT,
    metadata JSONB DEFAULT '{
        "checkedIn": false,
        "checkedInAt": null,
        "feedback": null,
        "rating": null
    }'::jsonb,
    PRIMARY KEY (event_id, user_id)
);

-- Add indexes
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_community ON posts(community_id);
CREATE INDEX idx_posts_type ON posts(type);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_created ON posts(created_at DESC);
CREATE INDEX idx_post_tags_tag ON post_tags(tag);
CREATE INDEX idx_post_responses_post ON post_responses(post_id);
CREATE INDEX idx_post_responses_user ON post_responses(user_id);
CREATE INDEX idx_events_organizer ON events(organizer_id);
CREATE INDEX idx_events_community ON events(community_id);
CREATE INDEX idx_events_dates ON events(start_date, end_date);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_custom_url ON events(custom_url);
CREATE INDEX idx_event_attendees_user ON event_attendees(user_id);
CREATE INDEX idx_event_attendees_status ON event_attendees(status);

-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_interested_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies
CREATE POLICY "Anyone can view posts"
    ON posts FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can create posts"
    ON posts FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own posts"
    ON posts FOR UPDATE
    TO authenticated
    USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own posts"
    ON posts FOR DELETE
    TO authenticated
    USING (auth.uid() = author_id);

CREATE POLICY "Anyone can view events"
    ON events FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can create events"
    ON events FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers can update events"
    ON events FOR UPDATE
    TO authenticated
    USING (auth.uid() = organizer_id);