# Migration Structure

## Naming Convention
Migrations follow the format: `YYYYMMDDHHMMSS_descriptive_name.sql`

## Order of Execution

1. `000000_cleanup.sql` - Clean up existing objects
2. `000001_extensions.sql` - Enable required extensions
3. `000002_initial_schema.sql` - Base tables (users, communities)
4. `000003_relationships.sql` - Foreign keys and relationships
5. `000004_posts_events.sql` - Posts and events system
6. `000005_messaging.sql` - Messaging system
7. `000006_ki_points.sql` - Ki points and transactions
8. `000007_notifications.sql` - Notifications system
9. `000008_search.sql` - Search functionality
10. `000009_analytics.sql` - Analytics and reporting
11. `000010_triggers.sql` - All triggers and functions
12. `000011_policies.sql` - RLS policies
13. `000012_views.sql` - Views and materialized views
14. `000013_indexes.sql` - Performance optimizations
15. `000014_sample_data.sql` - Sample data (development only)

## Important Notes

1. Each migration should be idempotent (can be run multiple times safely)
2. Use IF EXISTS/IF NOT EXISTS clauses
3. Include rollback logic where possible
4. Keep migrations focused and atomic
5. Document complex logic or business rules
6. Test migrations in development before production

## Folders

- `migrations/` - Main migrations
- `seeds/` - Sample data for development
- `functions/` - Database functions and procedures
- `policies/` - Security policies
- `types/` - TypeScript type definitions

## Testing

```bash
# Run migrations
supabase db reset

# Run specific migration
supabase db reset -f 20240315000001_initial_schema.sql
```