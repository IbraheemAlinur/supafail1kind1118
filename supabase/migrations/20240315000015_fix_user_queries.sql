-- Create a view for user profiles with post counts
CREATE OR REPLACE VIEW user_profiles AS
SELECT 
    u.*,
    COUNT(DISTINCT p.id) as total_posts,
    COUNT(DISTINCT cm.community_id) as total_communities,
    COALESCE(jsonb_object_agg(
        DISTINCT c.id, 
        jsonb_build_object(
            'name', c.name,
            'role', cm.role
        )
    ) FILTER (WHERE c.id IS NOT NULL), '{}'::jsonb) as communities
FROM users u
LEFT JOIN posts p ON u.id = p.author_id
LEFT JOIN community_members cm ON u.id = cm.user_id AND cm.status = 'approved'
LEFT JOIN communities c ON cm.community_id = c.id
GROUP BY u.id;

-- Create function to get user profile with related data
CREATE OR REPLACE FUNCTION get_user_profile(user_id UUID)
RETURNS jsonb AS $$
DECLARE
    profile jsonb;
BEGIN
    SELECT jsonb_build_object(
        'id', u.id,
        'name', u.name,
        'email', u.email,
        'avatar_url', u.avatar_url,
        'bio', u.bio,
        'location', u.location,
        'website', u.website,
        'custom_url', u.custom_url,
        'ki_points', u.ki_points,
        'role', u.role,
        'stats', u.stats,
        'settings', u.settings,
        'total_posts', COALESCE(
            (SELECT COUNT(*) FROM posts WHERE author_id = user_id),
            0
        ),
        'total_communities', COALESCE(
            (SELECT COUNT(*) FROM community_members 
             WHERE user_id = user_id AND status = 'approved'),
            0
        ),
        'communities', COALESCE(
            (SELECT jsonb_agg(
                jsonb_build_object(
                    'id', c.id,
                    'name', c.name,
                    'role', cm.role
                )
             )
             FROM community_members cm
             JOIN communities c ON cm.community_id = c.id
             WHERE cm.user_id = user_id AND cm.status = 'approved'),
            '[]'::jsonb
        )
    ) INTO profile
    FROM users u
    WHERE u.id = user_id;

    RETURN profile;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;