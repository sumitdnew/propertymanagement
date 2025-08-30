-- Check RLS status for all tables
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('buildings', 'profiles', 'maintenance_requests', 'payments', 'businesses', 'community_posts', 'invitations')
ORDER BY tablename;

-- Check current user context
SELECT 
  'Current User Context' as info,
  current_user,
  session_user,
  auth.role() as auth_role,
  auth.uid() as auth_uid;

-- Check if testadmin user exists in auth.users
SELECT 
  'Auth Users Check' as info,
  id,
  email,
  created_at,
  email_confirmed_at
FROM auth.users 
WHERE email = 'testadmin@ba-property.com';

-- Check testadmin profile
SELECT 
  'TestAdmin Profile' as info,
  id,
  email,
  name,
  user_type,
  building_id,
  created_at
FROM profiles 
WHERE email = 'testadmin@ba-property.com';
