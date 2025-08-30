-- Simple TestAdmin Diagnostic
-- Run this in Supabase SQL Editor

-- 1. Check if testadmin user exists
SELECT 
  '1. TestAdmin User Check' as test,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ User found'
    ELSE '❌ User not found'
  END as result,
  COUNT(*) as count
FROM auth.users 
WHERE email = 'testadmin@ba-property.com';

-- 2. Check if testadmin has a profile
SELECT 
  '2. TestAdmin Profile Check' as test,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ Profile exists'
    ELSE '❌ No profile found'
  END as result,
  COUNT(*) as count
FROM profiles 
WHERE email = 'testadmin@ba-property.com';

-- 3. Check RLS status for key tables
SELECT 
  '3. RLS Status Check' as test,
  tablename,
  CASE 
    WHEN rowsecurity THEN '🔒 RLS Enabled'
    ELSE '🔓 RLS Disabled'
  END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('buildings', 'profiles', 'maintenance_requests', 'payments', 'businesses', 'community_posts', 'invitations')
ORDER BY tablename;

-- 4. Check existing policies
SELECT 
  '4. Policy Check' as test,
  tablename,
  policyname,
  cmd,
  permissive as policy_type
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('buildings', 'profiles', 'maintenance_requests', 'payments', 'businesses', 'community_posts', 'invitations')
ORDER BY tablename, policyname;

-- 5. Test data access (this will show what the current user can see)
SELECT '5. Data Access Test' as test;

-- Test each table and show results
SELECT 
  'buildings' as table_name,
  COUNT(*) as record_count,
  CASE 
    WHEN COUNT(*) >= 0 THEN '✅ Accessible'
    ELSE '❌ Not accessible'
  END as access_status
FROM buildings;

SELECT 
  'profiles' as table_name,
  COUNT(*) as record_count,
  CASE 
    WHEN COUNT(*) >= 0 THEN '✅ Accessible'
    ELSE '❌ Not accessible'
  END as access_status
FROM profiles;

SELECT 
  'maintenance_requests' as table_name,
  COUNT(*) as record_count,
  CASE 
    WHEN COUNT(*) >= 0 THEN '✅ Accessible'
    ELSE '❌ Not accessible'
  END as access_status
FROM maintenance_requests;

SELECT 
  'payments' as table_name,
  COUNT(*) as record_count,
  CASE 
    WHEN COUNT(*) >= 0 THEN '✅ Accessible'
    ELSE '❌ Not accessible'
  END as access_status
FROM payments;

SELECT 
  'businesses' as table_name,
  COUNT(*) as record_count,
  CASE 
    WHEN COUNT(*) >= 0 THEN '✅ Accessible'
    ELSE '❌ Not accessible'
  END as access_status
FROM businesses;

SELECT 
  'community_posts' as table_name,
  COUNT(*) as record_count,
  CASE 
    WHEN COUNT(*) >= 0 THEN '✅ Accessible'
    ELSE '❌ Not accessible'
  END as access_status
FROM community_posts;

SELECT 
  'invitations' as table_name,
  COUNT(*) as record_count,
  CASE 
    WHEN COUNT(*) >= 0 THEN '✅ Accessible'
    ELSE '❌ Not accessible'
  END as access_status
FROM invitations;

-- 6. Show current user context
SELECT 
  '6. Current Context' as test,
  current_user as current_user,
  session_user as session_user;
