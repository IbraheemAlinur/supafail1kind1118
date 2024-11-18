-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL CHECK (amount > 0),
    type TEXT NOT NULL CHECK (type IN ('earned', 'spent', 'transfer')),
    category TEXT NOT NULL CHECK (category IN ('ask_payment', 'offer_payment', 'transfer', 'daily_bonus')),
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{
        "post_id": null,
        "event_id": null,
        "community_id": null,
        "completion_time": null,
        "rating": null,
        "feedback": null
    }'::jsonb,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    escrow_amount INTEGER DEFAULT 0,
    escrow_released_at TIMESTAMPTZ
);

-- Add indexes
CREATE INDEX idx_transactions_sender ON transactions(sender_id);
CREATE INDEX idx_transactions_recipient ON transactions(recipient_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_category ON transactions(category);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created ON transactions(created_at DESC);
CREATE INDEX idx_transactions_escrow ON transactions(escrow_amount) WHERE escrow_amount > 0;