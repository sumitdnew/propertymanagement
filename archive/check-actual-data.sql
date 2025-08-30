-- Check what data actually exists in the database
-- Run this in Supabase SQL Editor

-- Check buildings table
SELECT 'BUILDINGS TABLE' as table_name, COUNT(*) as total_records FROM buildings;
SELECT * FROM buildings LIMIT 5;

-- Check maintenance_requests table
SELECT 'MAINTENANCE_REQUESTS TABLE' as table_name, COUNT(*) as total_records FROM maintenance_requests;
SELECT * FROM maintenance_requests LIMIT 5;

-- Check payments table
SELECT 'PAYMENTS TABLE' as table_name, COUNT(*) as total_records FROM payments;
SELECT * FROM payments LIMIT 5;

-- Check invitations table
SELECT 'INVITATIONS TABLE' as table_name, COUNT(*) as total_records FROM invitations;
SELECT * FROM invitations LIMIT 5;

-- Check profiles table
SELECT 'PROFILES TABLE' as table_name, COUNT(*) as total_records FROM profiles;
SELECT * FROM profiles LIMIT 5;

-- Check if the sample data was actually inserted
SELECT 'SAMPLE DATA CHECK' as check_type,
  (SELECT COUNT(*) FROM buildings WHERE name LIKE '%Torre%' OR name LIKE '%Palermo%') as sample_buildings,
  (SELECT COUNT(*) FROM maintenance_requests WHERE title LIKE '%Fuga%' OR title LIKE '%Ascensor%') as sample_maintenance,
  (SELECT COUNT(*) FROM payments WHERE apartment IN ('3A', '5B', '2C')) as sample_payments,
  (SELECT COUNT(*) FROM invitations WHERE email LIKE '%maria%' OR email LIKE '%carlos%') as sample_invitations;
