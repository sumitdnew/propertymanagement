-- Comprehensive Diagnostic for testadmin Data Access Issues
-- Run this in Supabase SQL Editor

-- Step 1: Find the testadmin user ID
SELECT 
  'Step 1: Finding testadmin user' as step,
  id,
  email,
  created_at,
  raw_user_meta_data,
  role
FROM auth.users 
WHERE email = 'testadmin@ba-property.com';

-- Step 2: Check RLS status for all tables
SELECT 
  'Step 2: RLS Status' as step,
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('buildings', 'profiles', 'maintenance_requests', 'payments', 'businesses', 'community_posts', 'invitations')
ORDER BY tablename;

-- Step 3: Check existing policies
SELECT 
  'Step 3: Existing Policies' as step,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('buildings', 'profiles', 'maintenance_requests', 'payments', 'businesses', 'community_posts', 'invitations')
ORDER BY tablename, policyname;

-- Step 4: Check if testadmin has a profile
SELECT 
  'Step 4: testadmin profile check' as step,
  id,
  name,
  email,
  user_type,
  created_at
FROM profiles 
WHERE email = 'testadmin@ba-property.com';

-- Step 5: Test data access with current policies
SELECT 'Step 5: Testing data access' as step;

-- Test each table
SELECT 'buildings' as table_name, COUNT(*) as count FROM buildings;
SELECT 'profiles' as table_name, COUNT(*) as count FROM profiles;
SELECT 'maintenance_requests' as table_name, COUNT(*) as count FROM maintenance_requests;
SELECT 'payments' as table_name, COUNT(*) as count FROM payments;
SELECT 'businesses' as table_name, COUNT(*) as count FROM businesses;
SELECT 'community_posts' as table_name, COUNT(*) as count FROM community_posts;
SELECT 'invitations' as table_name, COUNT(*) as count FROM invitations;

-- Step 6: Check current user context (fixed version)
SELECT 
  'Step 6: Current context' as step,
  current_user,
  session_user,
  current_setting('role') as current_role;

-- Step 7: Check if auth schema functions are available
SELECT 
  'Step 7: Auth function check' as step,
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_schema = 'auth' 
  AND routine_name IN ('role', 'uid')
ORDER BY routine_name;
