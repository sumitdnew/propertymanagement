-- Verify RLS status and data access
-- Run this in Supabase SQL Editor

-- Check RLS status on all tables
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('buildings', 'profiles', 'maintenance_requests', 'payments', 'businesses', 'community_posts', 'invitations')
ORDER BY tablename;

-- Test direct data access
SELECT 'Direct buildings count' as test, COUNT(*) as count FROM buildings;
SELECT 'Direct profiles count' as test, COUNT(*) as count FROM profiles;
SELECT 'Direct maintenance_requests count' as test, COUNT(*) as count FROM maintenance_requests;

-- Show current user context
SELECT current_user, session_user;
