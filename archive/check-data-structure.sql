-- Check the actual data structure and content
-- Run this in Supabase SQL Editor

-- Check buildings data
SELECT 'BUILDINGS DATA' as table_name, 
       id, name, address, description, security_code, created_at
FROM buildings 
LIMIT 3;

-- Check maintenance requests data
SELECT 'MAINTENANCE REQUESTS DATA' as table_name,
       id, building_id, title, description, priority, status, estimated_cost, created_at
FROM maintenance_requests 
LIMIT 3;

-- Check payments data
SELECT 'PAYMENTS DATA' as table_name,
       id, building_id, apartment, amount, payment_type, due_date, status, payment_method, created_at
FROM payments 
LIMIT 3;

-- Check profiles data
SELECT 'PROFILES DATA' as table_name,
       id, name, email, phone, apartment, user_type, building_id, created_at
FROM profiles 
LIMIT 3;
