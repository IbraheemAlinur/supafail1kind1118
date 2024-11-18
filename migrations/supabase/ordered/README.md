# Migration Order

This folder contains migrations in the order they should be executed:

1. `000000_cleanup.sql` - Clean up existing objects
2. `000001_extensions.sql` - Enable required extensions
3. `000002_initial_schema.sql` - Create base tables (users)
4. `000003_user_triggers.sql` - Set up user creation triggers
5. `000004_community_schema.sql` - Community tables and relationships
6. `000005_posts_events_schema.sql` - Posts and events system
7. `000006_messaging_schema.sql` - Messaging system
8. `000007_ki_points_schema.sql` - Ki points and transactions
9. `000008_notifications_schema.sql` - Notifications system
10. `000009_search_schema.sql` - Search functionality
11. `000010_analytics_schema.sql` - Analytics and reporting
12. `000011_rls_policies.sql` - Row Level Security policies
13. `000012_indexes_optimizations.sql` - Performance optimizations

## Important Notes

1. The cleanup script (000000) should be run first to ensure a clean slate
2. Extensions (000001) must be enabled before any other operations
3. The user schema (000002) must be created before other tables that reference it
4. RLS policies (000011) should be applied after all tables are created
5. Indexes (000012) should be created last for optimal performance

## Verification Steps

After running migrations:

1. Verify extensions are enabled
2. Check table structures
3. Test user creation flow
4. Verify RLS policies
5. Test foreign key constraints
6. Check index creation