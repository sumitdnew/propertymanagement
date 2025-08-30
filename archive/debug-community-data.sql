-- Debug Community Data Access
-- This script helps identify why RLS policies might be returning empty data

-- 1. Check what data exists in the tables (without RLS)
SELECT 
    'Data Check (No RLS)' as check_type,
    'community_groups' as table_name,
    COUNT(*) as total_records
FROM community_groups
UNION ALL
SELECT 
    'Data Check (No RLS)' as check_type,
    'group_members' as table_name,
    COUNT(*) as total_records
FROM group_members
UNION ALL
SELECT 
    'Data Check (No RLS)' as check_type,
    'group_posts' as table_name,
    COUNT(*) as total_records
FROM group_posts;

-- 2. Check the actual data content
SELECT 
    'Sample Data' as check_type,
    'community_groups' as table_name,
    id,
    name,
    description,
    is_private,
    created_by,
    building_id
FROM community_groups
LIMIT 5;

SELECT 
    'Sample Data' as check_type,
    'group_members' as table_name,
    id,
    group_id,
    user_id,
    role,
    joined_at
FROM group_members
LIMIT 5;

-- 3. Check current RLS status
SELECT 
    'RLS Status' as check_type,
    schemaname,
    tablename,
    CASE 
        WHEN rowsecurity THEN '🔒 RLS Enabled'
        ELSE '🔓 RLS Disabled'
    END as rls_status
FROM pg_tables 
WHERE tablename IN ('community_groups', 'group_members', 'group_posts')
ORDER BY tablename;

-- 4. Check current policies
SELECT 
    'Current Policies' as check_type,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('community_groups', 'group_members', 'group_posts')
ORDER BY tablename, policyname;

-- 5. Test RLS policies as different user roles
-- This simulates what different users would see

-- Test as authenticated user (this is what your app should see)
SELECT 
    'RLS Test - Authenticated User' as test_type,
    'community_groups' as table_name,
    COUNT(*) as visible_records
FROM community_groups;

SELECT 
    'RLS Test - Authenticated User' as test_type,
    'group_members' as table_name,
    COUNT(*) as visible_records
FROM group_members;

-- 6. Check if there are any data issues
-- Look for NULL values or invalid references
SELECT 
    'Data Quality Check' as check_type,
    'community_groups' as table_name,
    'NULL created_by' as issue,
    COUNT(*) as count
FROM community_groups 
WHERE created_by IS NULL
UNION ALL
SELECT 
    'Data Quality Check' as check_type,
    'group_members' as table_name,
    'NULL user_id' as issue,
    COUNT(*) as count
FROM group_members 
WHERE user_id IS NULL
UNION ALL
SELECT 
    'Data Quality Check' as check_type,
    'group_members' as table_name,
    'NULL group_id' as issue,
    COUNT(*) as count
FROM group_members 
WHERE group_id IS NULL;

-- 7. Check building associations
SELECT 
    'Building Check' as check_type,
    'community_groups' as table_name,
    COUNT(*) as total_groups,
    COUNT(DISTINCT building_id) as unique_buildings,
    COUNT(CASE WHEN building_id IS NULL THEN 1 END) as null_buildings
FROM community_groups;
