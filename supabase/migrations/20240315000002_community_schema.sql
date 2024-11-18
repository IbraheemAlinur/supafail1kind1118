-- Create community_invite_links table
CREATE TABLE IF NOT EXISTS community_invite_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
    code TEXT NOT NULL UNIQUE,
    created_by UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    max_uses INTEGER,
    uses INTEGER NOT NULL DEFAULT 0,
    metadata JSONB DEFAULT '{
        "notes": null,
        "restrictions": [],
        "customMessage": null
    }'::jsonb
);

-- Add indexes
CREATE INDEX idx_community_invite_links_code ON community_invite_links(code);
CREATE INDEX idx_community_invite_links_community ON community_invite_links(community_id);
CREATE INDEX idx_community_invite_links_expires ON community_invite_links(expires_at) WHERE expires_at IS NOT NULL;

-- Enable RLS
ALTER TABLE community_invite_links ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invite links
CREATE POLICY "Anyone can view active invite links"
    ON community_invite_links FOR SELECT
    TO authenticated
    USING (
        expires_at IS NULL OR 
        expires_at > NOW()
    );

CREATE POLICY "Members can create invite links"
    ON community_invite_links FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM community_members
            WHERE community_id = community_invite_links.community_id
            AND user_id = auth.uid()
            AND status = 'approved'
            AND role IN ('admin', 'moderator')
        )
    );

CREATE POLICY "Members can delete their own invite links"
    ON community_invite_links FOR DELETE
    TO authenticated
    USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM community_members
            WHERE community_id = community_invite_links.community_id
            AND user_id = auth.uid()
            AND status = 'approved'
            AND role IN ('admin', 'moderator')
        )
    );

-- Function to increment invite link uses
CREATE OR REPLACE FUNCTION increment_invite_link_uses()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE community_invite_links
    SET uses = uses + 1
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to validate invite link
CREATE OR REPLACE FUNCTION validate_invite_link(link_code TEXT)
RETURNS UUID AS $$
DECLARE
    link_record community_invite_links;
BEGIN
    SELECT * INTO link_record
    FROM community_invite_links
    WHERE code = link_code
    AND (expires_at IS NULL OR expires_at > NOW())
    AND (max_uses IS NULL OR uses < max_uses)
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invalid or expired invite link';
    END IF;

    RETURN link_record.community_id;
END;
$$ LANGUAGE plpgsql;