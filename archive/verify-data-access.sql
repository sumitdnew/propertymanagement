-- Verify data access and RLS status
-- Run this in Supabase SQL Editor

-- Check RLS status
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('buildings', 'profiles', 'maintenance_requests')
ORDER BY tablename;

-- Test direct access as anon user
SELECT 'ANON USER TEST' as test_type;

-- Test buildings access
SELECT 'buildings' as table_name, COUNT(*) as count FROM buildings;

-- Test profiles access  
SELECT 'profiles' as table_name, COUNT(*) as count FROM profiles;

-- Test maintenance_requests access
SELECT 'maintenance_requests' as table_name, COUNT(*) as count FROM maintenance_requests;

-- Show current user context
SELECT 
  current_user,
  session_user,
  current_setting('role') as current_role;
