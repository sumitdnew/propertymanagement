-- Temporarily disable RLS for testing
-- Run this in Supabase SQL Editor

-- Disable RLS on all tables
ALTER TABLE buildings DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE businesses DISABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE invitations DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('buildings', 'profiles', 'maintenance_requests', 'payments', 'businesses', 'community_posts', 'invitations')
ORDER BY tablename;

-- Check if data is now accessible
SELECT 'buildings' as table_name, COUNT(*) as row_count FROM buildings;
SELECT 'profiles' as table_name, COUNT(*) as row_count FROM profiles;
SELECT 'maintenance_requests' as table_name, COUNT(*) as row_count FROM maintenance_requests;
SELECT 'payments' as table_name, COUNT(*) as row_count FROM payments;
SELECT 'businesses' as table_name, COUNT(*) as row_count FROM businesses;
SELECT 'community_posts' as table_name, COUNT(*) as row_count FROM community_posts;
SELECT 'invitations' as table_name, COUNT(*) as row_count FROM invitations;

-- Show sample data to confirm access
SELECT 'buildings sample' as info, * FROM buildings LIMIT 2;
SELECT 'profiles sample' as info, * FROM profiles LIMIT 2;
