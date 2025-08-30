-- Fix RLS policies for authenticated users to read data
-- Run this in Supabase SQL Editor

-- First, let's check current RLS status
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('buildings', 'profiles', 'maintenance_requests', 'payments', 'businesses', 'community_posts', 'invitations')
ORDER BY tablename;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON buildings;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON maintenance_requests;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON payments;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON businesses;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON community_posts;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON invitations;

-- Create policies for authenticated users to read data
-- Buildings: Allow authenticated users to read all buildings
CREATE POLICY "Enable read access for authenticated users" ON buildings
  FOR SELECT USING (auth.role() = 'authenticated');

-- Profiles: Allow authenticated users to read all profiles
CREATE POLICY "Enable read access for authenticated users" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- Maintenance requests: Allow authenticated users to read all maintenance requests
CREATE POLICY "Enable read access for authenticated users" ON maintenance_requests
  FOR SELECT USING (auth.role() = 'authenticated');

-- Payments: Allow authenticated users to read all payments
CREATE POLICY "Enable read access for authenticated users" ON payments
  FOR SELECT USING (auth.role() = 'authenticated');

-- Businesses: Allow authenticated users to read all businesses
CREATE POLICY "Enable read access for authenticated users" ON businesses
  FOR SELECT USING (auth.role() = 'authenticated');

-- Community posts: Allow authenticated users to read all community posts
CREATE POLICY "Enable read access for authenticated users" ON community_posts
  FOR SELECT USING (auth.role() = 'authenticated');

-- Invitations: Allow authenticated users to read all invitations
CREATE POLICY "Enable read access for authenticated users" ON invitations
  FOR SELECT USING (auth.role() = 'authenticated');

-- Verify the policies were created
SELECT 
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

-- Test data access as authenticated user
-- This simulates what the frontend should be able to do
SELECT 'Testing authenticated user access' as test_type;

-- Test each table
SELECT 'buildings' as table_name, COUNT(*) as count FROM buildings;
SELECT 'profiles' as table_name, COUNT(*) as count FROM profiles;
SELECT 'maintenance_requests' as table_name, COUNT(*) as count FROM maintenance_requests;
SELECT 'payments' as table_name, COUNT(*) as count FROM payments;
SELECT 'businesses' as table_name, COUNT(*) as count FROM businesses;
SELECT 'community_posts' as table_name, COUNT(*) as count FROM community_posts;
SELECT 'invitations' as table_name, COUNT(*) as count FROM invitations;
