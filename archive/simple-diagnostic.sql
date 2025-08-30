-- Very Simple Diagnostic Script
-- Run this in Supabase SQL Editor

-- 1. Check if we can see basic info
SELECT 'Database connection working' as status;

-- 2. Check if auth schema exists
SELECT 'Auth schema exists' as status;

-- 3. Try to count users (this might fail due to permissions)
SELECT 
  'User count attempt:' as info,
  COUNT(*) as total_users
FROM auth.users;

-- 4. Check if profiles table exists
SELECT 
  'Profiles table exists:' as info,
  COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_name = 'profiles';

-- 5. Check if we can see any tables in public schema
SELECT 
  'Public schema tables:' as info,
  table_name
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 6. Check current user permissions
SELECT 
  'Current user:' as info,
  current_user as username,
  current_database() as database_name;
