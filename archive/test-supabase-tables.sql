-- Test to see what tables actually exist in the database
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Also check if the specific tables we're trying to query exist
SELECT 
  'buildings' as table_name,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'buildings') as exists
UNION ALL
SELECT 
  'profiles' as table_name,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') as exists
UNION ALL
SELECT 
  'maintenance_requests' as table_name,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'maintenance_requests') as exists
UNION ALL
SELECT 
  'payments' as table_name,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'payments') as exists
UNION ALL
SELECT 
  'businesses' as table_name,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'businesses') as exists
UNION ALL
SELECT 
  'community_posts' as table_name,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'community_posts') as exists
UNION ALL
SELECT 
  'invitations' as table_name,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'invitations') as exists;
