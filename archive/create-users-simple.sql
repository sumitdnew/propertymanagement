-- Simple User Creation Troubleshooting Script
-- Run this in Supabase SQL Editor to check current state

-- Check if users table exists and has data
SELECT 'Checking auth.users table...' as status;

-- This should show your existing users (if any)
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at,
  raw_user_meta_data
FROM auth.users
LIMIT 10;

-- Check if profiles table exists
SELECT 'Checking profiles table...' as status;

-- This should show your profiles table structure
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Check current user count
SELECT 
  'Current user count:' as info,
  COUNT(*) as total_users
FROM auth.users;

-- Check if you can see the auth schema
SELECT 'Checking auth schema access...' as status;

-- This should show available schemas
SELECT schema_name 
FROM information_schema.schemata 
WHERE schema_name LIKE 'auth%';

-- If you get errors above, try this simpler approach:
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Click "Add User" 
-- 3. Use these credentials:
--    Email: test@example.com
--    Password: TestPass123!
--    Name: Test User
-- 4. See what error message you get

-- Common error messages and solutions:
-- "User already registered" → Delete existing user first
-- "Invalid email" → Check email format
-- "Password too weak" → Use stronger password like TestPass123!
-- "Email confirmation required" → Disable email confirmation in settings
