-- Fix testadmin profile to ensure data access (CORRECTED VERSION)
-- This script ensures testadmin has a complete profile with building_id

-- First, let's see the actual structure of the profiles table
SELECT 
  'Profiles table structure:' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- First, let's see what buildings exist
SELECT 'Available Buildings:' as info, id, name, address FROM buildings LIMIT 5;

-- Check if testadmin profile exists and what's missing
SELECT 
  'Current testadmin profile:' as info,
  id,
  email,
  user_type,
  building_id,
  created_at
FROM profiles 
WHERE email = 'testadmin@ba-property.com';

-- Get testadmin user ID
SELECT 
  'Testadmin user ID:' as info,
  id,
  email
FROM auth.users 
WHERE email = 'testadmin@ba-property.com';

-- Update or insert testadmin profile with building_id
-- First, get a building ID to assign
DO $$
DECLARE
  building_id_to_assign uuid;
  testadmin_user_id uuid;
BEGIN
  -- Get the first available building
  SELECT id INTO building_id_to_assign FROM buildings LIMIT 1;
  
  -- Get testadmin user ID
  SELECT id INTO testadmin_user_id FROM auth.users WHERE email = 'testadmin@ba-property.com';
  
  -- If no building exists, create one
  IF building_id_to_assign IS NULL THEN
    INSERT INTO buildings (name, address, city, state, zip_code, total_units, available_units)
    VALUES ('Test Building', '123 Test Street', 'Test City', 'TS', '12345', 10, 5)
    RETURNING id INTO building_id_to_assign;
  END IF;
  
  -- Update or insert testadmin profile (using correct column names)
  INSERT INTO profiles (id, email, user_type, building_id, name, phone)
  VALUES (
    testadmin_user_id,
    'testadmin@ba-property.com',
    'property-manager',
    building_id_to_assign,
    'Test Admin',
    '+54 11 1111-1111'
  )
  ON CONFLICT (id) 
  DO UPDATE SET
    building_id = building_id_to_assign,
    user_type = 'property-manager',
    name = 'Test Admin',
    phone = '+54 11 1111-1111';
    
  RAISE NOTICE 'Assigned building_id % to testadmin profile', building_id_to_assign;
END $$;

-- Verify the updated profile
SELECT 
  'Updated testadmin profile:' as info,
  id,
  email,
  user_type,
  building_id,
  name,
  phone,
  created_at
FROM profiles 
WHERE email = 'testadmin@ba-property.com';

-- Test data access as testadmin
-- This simulates what the frontend should be able to access
SELECT 
  'Test: Profiles count' as test,
  COUNT(*) as count
FROM profiles;

SELECT 
  'Test: Buildings count' as test,
  COUNT(*) as count
FROM buildings;

SELECT 
  'Test: Maintenance requests count' as test,
  COUNT(*) as count
FROM maintenance_requests;

SELECT 
  'Test: Payments count' as test,
  COUNT(*) as count
FROM payments;
