-- Fix users table schema
ALTER TABLE users 
DROP COLUMN IF EXISTS stats,
DROP COLUMN IF EXISTS settings,
ADD COLUMN IF NOT EXISTS stats JSONB DEFAULT '{
    "monthlyPoints": 0,
    "quarterlyPoints": 0,
    "yearlyPoints": 0,
    "totalEarned": 0,
    "totalSpent": 0,
    "lastUpdated": null,
    "asksCompleted": 0,
    "offersCompleted": 0,
    "responseRate": 100,
    "averageRating": 0,
    "totalRatings": 0,
    "reputation": 0
}'::jsonb,
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{
    "theme": "light",
    "language": "en",
    "timezone": "UTC",
    "notifications": {
        "email": true,
        "browser": true,
        "mobile": true,
        "digest": "daily"
    },
    "privacy": {
        "showEmail": false,
        "showLocation": true,
        "showActivity": true
    }
}'::jsonb;

-- Fix communities table schema
ALTER TABLE communities 
DROP COLUMN IF EXISTS stats,
DROP COLUMN IF EXISTS settings,
ADD COLUMN IF NOT EXISTS stats JSONB DEFAULT '{
    "totalPosts": 0,
    "totalEvents": 0,
    "totalKiPoints": 0,
    "activeMembers": 0,
    "weeklyGrowth": 0,
    "monthlyGrowth": 0,
    "engagementRate": 0,
    "topContributors": []
}'::jsonb,
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{
    "allowMemberPosts": true,
    "allowMemberEvents": true,
    "allowMemberInvites": true,
    "autoApproveMembers": true,
    "defaultKiPoints": {
        "ask": 100,
        "offer": 50
    },
    "categories": [],
    "tags": [],
    "moderation": {
        "requirePostApproval": false,
        "autoModeration": true,
        "bannedWords": []
    }
}'::jsonb;

-- Fix community_members table schema
ALTER TABLE community_members
ALTER COLUMN role SET DEFAULT 'member',
ALTER COLUMN role SET NOT NULL,
ADD CONSTRAINT community_members_role_check CHECK (role IN ('member', 'moderator', 'admin')),
ALTER COLUMN status SET DEFAULT 'pending',
ALTER COLUMN status SET NOT NULL,
ADD CONSTRAINT community_members_status_check CHECK (status IN ('pending', 'approved', 'rejected'));

-- Update existing records with default values
UPDATE users 
SET 
    stats = COALESCE(stats, '{
        "monthlyPoints": 0,
        "quarterlyPoints": 0,
        "yearlyPoints": 0,
        "totalEarned": 0,
        "totalSpent": 0,
        "lastUpdated": null,
        "asksCompleted": 0,
        "offersCompleted": 0,
        "responseRate": 100,
        "averageRating": 0,
        "totalRatings": 0,
        "reputation": 0
    }'::jsonb),
    settings = COALESCE(settings, '{
        "theme": "light",
        "language": "en",
        "timezone": "UTC",
        "notifications": {
            "email": true,
            "browser": true,
            "mobile": true,
            "digest": "daily"
        },
        "privacy": {
            "showEmail": false,
            "showLocation": true,
            "showActivity": true
        }
    }'::jsonb);

UPDATE communities 
SET 
    stats = COALESCE(stats, '{
        "totalPosts": 0,
        "totalEvents": 0,
        "totalKiPoints": 0,
        "activeMembers": 0,
        "weeklyGrowth": 0,
        "monthlyGrowth": 0,
        "engagementRate": 0,
        "topContributors": []
    }'::jsonb),
    settings = COALESCE(settings, '{
        "allowMemberPosts": true,
        "allowMemberEvents": true,
        "allowMemberInvites": true,
        "autoApproveMembers": true,
        "defaultKiPoints": {
            "ask": 100,
            "offer": 50
        },
        "categories": [],
        "tags": [],
        "moderation": {
            "requirePostApproval": false,
            "autoModeration": true,
            "bannedWords": []
        }
    }'::jsonb);