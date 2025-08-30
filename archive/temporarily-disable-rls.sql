-- Temporarily disable RLS for testing
-- WARNING: This is for testing only - re-enable RLS after testing!

-- Disable RLS on main tables
ALTER TABLE buildings DISABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE invitations DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Test data access without RLS
SELECT 'Buildings without RLS:' as test, COUNT(*) as count FROM buildings;
SELECT 'Maintenance Requests without RLS:' as test, COUNT(*) as count FROM maintenance_requests;
SELECT 'Payments without RLS:' as test, COUNT(*) as count FROM payments;
SELECT 'Invitations without RLS:' as test, COUNT(*) as count FROM invitations;
SELECT 'Profiles without RLS:' as test, COUNT(*) as count FROM profiles;

-- Show some sample data
SELECT 'Sample Buildings:' as test, name, address FROM buildings LIMIT 3;
SELECT 'Sample Maintenance Requests:' as test, title, status FROM maintenance_requests LIMIT 3;
SELECT 'Sample Payments:' as test, apartment, amount, status FROM payments LIMIT 3;
