-- Check all available data in the database
-- Run this in Supabase SQL Editor

-- Check buildings data
SELECT 'BUILDINGS DATA' as table_name, 
       id, name, address, description, security_code, created_at
FROM buildings 
LIMIT 5;

-- Check maintenance requests data
SELECT 'MAINTENANCE REQUESTS DATA' as table_name,
       id, building_id, title, description, priority, status, estimated_cost, created_at
FROM maintenance_requests 
LIMIT 5;

-- Check payments data
SELECT 'PAYMENTS DATA' as table_name,
       id, building_id, apartment, amount, payment_type, due_date, status, payment_method, created_at
FROM payments 
LIMIT 5;

-- Check profiles by user type
SELECT 'PROFILES BY USER TYPE' as table_name,
       user_type, COUNT(*) as count
FROM profiles 
GROUP BY user_type;

-- Check if there are any tenant profiles
SELECT 'TENANT PROFILES' as table_name,
       id, name, email, phone, apartment, user_type, building_id
FROM profiles 
WHERE user_type = 'tenant'
LIMIT 5;
