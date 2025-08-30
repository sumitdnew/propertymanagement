-- Create new test users for BA Property Manager
-- Run this in your Supabase SQL Editor

-- First, let's create some test users in auth.users (if they don't exist)
-- Note: You'll need to create these users through the Supabase Dashboard or API first
-- Then we can insert their profiles

-- Test User 1: Admin/Property Manager
INSERT INTO profiles (id, name, email, phone, apartment, user_type, created_at) VALUES
(
  gen_random_uuid(), -- This will be replaced with actual auth.users id
  'Test Admin',
  'testadmin@ba-property.com',
  '+54 11 1111-1111',
  'Admin',
  'property-manager',
  NOW()
);

-- Test User 2: Tenant
INSERT INTO profiles (id, name, email, phone, apartment, user_type, created_at) VALUES
(
  gen_random_uuid(), -- This will be replaced with actual auth.users id
  'Test Tenant',
  'testtenant@ba-property.com',
  '+54 11 2222-2222',
  '5A',
  'tenant',
  NOW()
);

-- Test User 3: Building Owner
INSERT INTO profiles (id, name, email, phone, apartment, user_type, created_at) VALUES
(
  gen_random_uuid(), -- This will be replaced with actual auth.users id
  'Test Owner',
  'testowner@ba-property.com',
  '+54 11 3333-3333',
  'Admin',
  'building-owner',
  NOW()
);

-- Test User 4: Another Tenant
INSERT INTO profiles (id, name, email, phone, apartment, user_type, created_at) VALUES
(
  gen_random_uuid(), -- This will be replaced with actual auth.users id
  'Test Tenant 2',
  'testtenant2@ba-property.com',
  '+54 11 4444-4444',
  '3B',
  'tenant',
  NOW()
);
