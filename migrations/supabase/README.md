# Supabase Migration Guide

## Migration Order

1. `000000_cleanup.sql` - Clean up existing objects
2. `000001_extensions.sql` - Enable required extensions
3. `000002_initial_schema.sql` - Create base tables (users, communities)
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

1. Each migration is idempotent (can be run multiple times safely)
2. Uses IF EXISTS/IF NOT EXISTS clauses
3. Includes rollback logic where possible
4. Migrations are focused and atomic
5. Complex logic and business rules are documented
6. All migrations are tested in development before production

## Execution

```bash
# Run all migrations
supabase db reset

# Run specific migration
supabase db reset -f 20240315000001_initial_schema.sql
```

## Structure

- `schemas/` - Database schemas and types
- `functions/` - Database functions and procedures
- `policies/` - Security policies
- `seeds/` - Sample data for development
- `types/` - TypeScript type definitions

## Testing

Each migration includes:
- Pre-conditions check
- Data validation
- Error handling
- Post-migration verification

## Monitoring

Key metrics to watch:
- Query execution time
- Index usage
- Cache hit rates
- Table bloat
- Connection pooling

## Maintenance

Regular tasks:
- Refresh materialized views
- Update table statistics
- Monitor query performance
- Clean up old data