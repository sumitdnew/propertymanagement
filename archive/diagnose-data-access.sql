-- Diagnostic script to check data access for testadmin user
-- Run this in Supabase SQL Editor

-- 1. Check current user context
SELECT 
  'Current Context' as test,
  current_user as current_user,
  session_user as session_user,
  auth.role() as auth_role,
  auth.uid() as auth_uid;

-- 2. Check if testadmin user exists and has a profile
SELECT 
  'TestAdmin User Check' as test,
  u.id,
  u.email,
  u.raw_user_meta_data,
  p.id as profile_id,
  p.name as profile_name,
  p.user_type,
  p.building_id
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'testadmin@ba-property.com';

-- 3. Check what buildings exist
SELECT 
  'Buildings Data' as test,
  COUNT(*) as total_buildings,
  array_agg(name) as building_names
FROM buildings;

-- 4. Check what maintenance requests exist
SELECT 
  'Maintenance Requests Data' as test,
  COUNT(*) as total_requests,
  array_agg(title) as request_titles
FROM maintenance_requests;

-- 5. Check what payments exist
SELECT 
  'Payments Data' as test,
  COUNT(*) as total_payments,
  array_agg(apartment) as payment_apartments
FROM payments;

-- 6. Check what invitations exist
SELECT 
  'Invitations Data' as test,
  COUNT(*) as total_invitations,
  array_agg(email) as invitation_emails
FROM invitations;

-- 7. Test RLS policies by trying to access data as testadmin
-- First, let's see what RLS policies exist
SELECT 
  'RLS Policies' as test,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 8. Check if RLS is enabled on tables
SELECT 
  'RLS Status' as test,
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('buildings', 'maintenance_requests', 'payments', 'invitations', 'profiles');
