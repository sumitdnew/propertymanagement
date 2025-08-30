-- Check what data exists in the database
-- Run this in Supabase SQL Editor

-- Check all tables and their row counts
SELECT 
  schemaname,
  relname as tablename,
  n_tup_ins as rows_inserted,
  n_tup_upd as rows_updated,
  n_tup_del as rows_deleted
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
ORDER BY relname;

-- Check specific table contents
SELECT 'buildings' as table_name, COUNT(*) as row_count FROM buildings
UNION ALL
SELECT 'profiles', COUNT(*) FROM profiles
UNION ALL
SELECT 'maintenance_requests', COUNT(*) FROM maintenance_requests
UNION ALL
SELECT 'payments', COUNT(*) FROM payments
UNION ALL
SELECT 'businesses', COUNT(*) FROM businesses
UNION ALL
SELECT 'community_posts', COUNT(*) FROM community_posts
UNION ALL
SELECT 'invitations', COUNT(*) FROM invitations;

-- Check auth.users
SELECT 'auth.users' as table_name, COUNT(*) as row_count FROM auth.users;

-- Check a few sample rows from each table
SELECT 'buildings sample' as info, * FROM buildings LIMIT 3;
SELECT 'profiles sample' as info, * FROM profiles LIMIT 3;
SELECT 'maintenance_requests sample' as info, * FROM maintenance_requests LIMIT 3;
