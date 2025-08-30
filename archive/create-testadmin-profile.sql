-- Create profile for testadmin user
-- Run this in Supabase SQL Editor

-- First, find the testadmin user ID from auth.users
SELECT 
  id,
  email,
  created_at,
  raw_user_meta_data
FROM auth.users 
WHERE email = 'testadmin@ba-property.com';

-- If testadmin exists, create a profile for it
-- Replace 'TESTADMIN_USER_ID' with the actual ID from the query above
INSERT INTO profiles (id, name, email, phone, apartment, user_type, building_id, created_at, updated_at) VALUES
(
  'TESTADMIN_USER_ID', -- Replace with actual auth.users id from above query
  'Test Admin',
  'testadmin@ba-property.com',
  '+54 11 1111-1111',
  'Admin',
  'property-manager',
  '550e8400-e29b-41d4-a716-446655440001', -- Building ID from existing data
  NOW(),
  NOW()
);

-- Verify the profile was created
SELECT * FROM profiles WHERE email = 'testadmin@ba-property.com';

-- Also, let's check what other test users might be missing
SELECT 
  u.id,
  u.email,
  u.created_at,
  CASE WHEN p.id IS NULL THEN 'MISSING PROFILE' ELSE 'HAS PROFILE' END as profile_status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email LIKE '%test%' OR u.email LIKE '%admin%'
ORDER BY u.created_at DESC;
