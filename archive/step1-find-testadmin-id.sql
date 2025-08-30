-- Step 1: Find the testadmin user ID
-- Run this first in Supabase SQL Editor

SELECT 
  id,
  email,
  created_at,
  raw_user_meta_data
FROM auth.users 
WHERE email = 'testadmin@ba-property.com';
