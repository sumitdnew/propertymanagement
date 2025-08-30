-- Fix testadmin Data Access Issues
-- Run this in Supabase SQL Editor

-- Step 1: Find the testadmin user ID
DO $$
DECLARE
    testadmin_id UUID;
BEGIN
    SELECT id INTO testadmin_id 
    FROM auth.users 
    WHERE email = 'testadmin@ba-property.com';
    
    IF testadmin_id IS NULL THEN
        RAISE EXCEPTION 'testadmin user not found. Please create the user first.';
    END IF;
    
    RAISE NOTICE 'Found testadmin user with ID: %', testadmin_id;
END $$;

-- Step 2: Ensure testadmin has a profile
INSERT INTO profiles (id, name, email, user_type, created_at, updated_at)
SELECT 
    au.id,
    COALESCE(au.raw_user_meta_data->>'name', 'Test Admin'),
    au.email,
    COALESCE(au.raw_user_meta_data->>'user_type', 'property-manager'),
    au.created_at,
    NOW()
FROM auth.users au
WHERE au.email = 'testadmin@ba-property.com'
  AND NOT EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = au.id
  );

-- Step 3: Drop any conflicting policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON buildings;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON maintenance_requests;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON payments;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON businesses;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON community_posts;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON invitations;

-- Step 4: Create comprehensive policies for authenticated users
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

-- Step 5: Create write policies for property managers
-- Buildings: Allow property managers to insert/update buildings
CREATE POLICY "Enable write access for property managers" ON buildings
  FOR ALL USING (
    auth.role() = 'authenticated' AND 
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.user_type IN ('property-manager', 'building-owner')
    )
  );

-- Profiles: Allow users to update their own profile
CREATE POLICY "Enable update for own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Maintenance requests: Allow authenticated users to create requests
CREATE POLICY "Enable insert for authenticated users" ON maintenance_requests
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Step 6: Verify the policies were created
SELECT 
  'Policy verification' as step,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('buildings', 'profiles', 'maintenance_requests', 'payments', 'businesses', 'community_posts', 'invitations')
ORDER BY tablename, policyname;

-- Step 7: Test data access
SELECT 'Testing data access after policy creation' as step;

-- Test each table
SELECT 'buildings' as table_name, COUNT(*) as count FROM buildings;
SELECT 'profiles' as table_name, COUNT(*) as count FROM profiles;
SELECT 'maintenance_requests' as table_name, COUNT(*) as count FROM maintenance_requests;
SELECT 'payments' as table_name, COUNT(*) as count FROM payments;
SELECT 'businesses' as table_name, COUNT(*) as count FROM businesses;
SELECT 'community_posts' as table_name, COUNT(*) as count FROM community_posts;
SELECT 'invitations' as table_name, COUNT(*) as count FROM invitations;

-- Step 8: Show testadmin profile
SELECT 
  'testadmin profile after fix' as step,
  id,
  name,
  email,
  user_type,
  created_at
FROM profiles 
WHERE email = 'testadmin@ba-property.com';
