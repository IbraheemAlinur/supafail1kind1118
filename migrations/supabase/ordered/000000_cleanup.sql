-- Drop all objects in a safe way
DO $$ 
DECLARE
    _sql text;
BEGIN
    -- Drop triggers if they exist
    FOR _sql IN (
        SELECT 'DROP TRIGGER IF EXISTS ' || tgname || ' ON ' || tgrelid::regclass || ' CASCADE;'
        FROM pg_trigger
        WHERE tgname IN (
            'on_auth_user_created',
            'on_user_profile_updated',
            'update_post_stats_trigger',
            'update_user_points_trigger',
            'handle_post_transaction_trigger',
            'update_community_stats_trigger',
            'handle_community_creation_trigger',
            'handle_community_member_trigger',
            'handle_post_creation_trigger',
            'handle_event_creation_trigger',
            'handle_transaction_trigger',
            'update_user_stats_trigger',
            'posts_search_vector_update',
            'communities_search_update'
        )
    ) LOOP
        EXECUTE _sql;
    END LOOP;

    -- Drop functions
    DROP FUNCTION IF EXISTS handle_new_user CASCADE;
    DROP FUNCTION IF EXISTS sync_user_profile CASCADE;
    DROP FUNCTION IF EXISTS update_post_stats CASCADE;
    DROP FUNCTION IF EXISTS handle_transaction CASCADE;
    DROP FUNCTION IF EXISTS update_community_stats CASCADE;
    DROP FUNCTION IF EXISTS handle_community_creation CASCADE;
    DROP FUNCTION IF EXISTS handle_community_member CASCADE;
    DROP FUNCTION IF EXISTS handle_post_creation CASCADE;
    DROP FUNCTION IF EXISTS handle_event_creation CASCADE;
    DROP FUNCTION IF EXISTS update_user_stats CASCADE;
    DROP FUNCTION IF EXISTS increment_invite_link_uses CASCADE;
    DROP FUNCTION IF EXISTS validate_invite_link CASCADE;
    DROP FUNCTION IF EXISTS is_community_member CASCADE;
    DROP FUNCTION IF EXISTS is_admin CASCADE;
    DROP FUNCTION IF EXISTS get_user_role CASCADE;
    DROP FUNCTION IF EXISTS safe_jsonb_set CASCADE;
    DROP FUNCTION IF EXISTS promote_to_admin CASCADE;
    DROP FUNCTION IF EXISTS revoke_admin CASCADE;
    DROP FUNCTION IF EXISTS log_user_creation_error CASCADE;
    DROP FUNCTION IF EXISTS update_post_search_vector CASCADE;
    DROP FUNCTION IF EXISTS update_community_search_vector CASCADE;

    -- Drop policies safely
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

    -- Drop tables in correct order
    DROP TABLE IF EXISTS user_creation_logs CASCADE;
    DROP TABLE IF EXISTS post_responses CASCADE;
    DROP TABLE IF EXISTS post_interested_users CASCADE;
    DROP TABLE IF EXISTS post_tags CASCADE;
    DROP TABLE IF EXISTS posts CASCADE;
    DROP TABLE IF EXISTS event_attendees CASCADE;
    DROP TABLE IF EXISTS events CASCADE;
    DROP TABLE IF EXISTS messages CASCADE;
    DROP TABLE IF EXISTS message_threads CASCADE;
    DROP TABLE IF EXISTS transactions CASCADE;
    DROP TABLE IF EXISTS community_application_questions CASCADE;
    DROP TABLE IF EXISTS community_invite_links CASCADE;
    DROP TABLE IF EXISTS community_tags CASCADE;
    DROP TABLE IF EXISTS community_members CASCADE;
    DROP TABLE IF EXISTS communities CASCADE;
    DROP TABLE IF EXISTS users CASCADE;

    -- Drop views
    DROP VIEW IF EXISTS user_profiles CASCADE;
    DROP VIEW IF EXISTS user_posts CASCADE;
    DROP VIEW IF EXISTS active_posts CASCADE;
    DROP VIEW IF EXISTS upcoming_events CASCADE;

    -- Drop materialized views
    DROP MATERIALIZED VIEW IF EXISTS community_stats CASCADE;
    DROP MATERIALIZED VIEW IF EXISTS user_activity CASCADE;
    DROP MATERIALIZED VIEW IF EXISTS user_engagement_metrics CASCADE;
    DROP MATERIALIZED VIEW IF EXISTS community_engagement_metrics CASCADE;
    DROP MATERIALIZED VIEW IF EXISTS post_visibility CASCADE;

    -- Drop extensions if they exist
    DROP EXTENSION IF EXISTS "uuid-ossp" CASCADE;
    DROP EXTENSION IF EXISTS "pgcrypto" CASCADE;
    DROP EXTENSION IF EXISTS "pg_trgm" CASCADE;
    DROP EXTENSION IF EXISTS "fuzzystrmatch" CASCADE;
END $$;