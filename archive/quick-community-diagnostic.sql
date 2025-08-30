-- Quick Community Tables Diagnostic
-- Run this to identify the current state of your community tables

-- 1. Check if tables exist
SELECT 
    'Table Existence' as check_type,
    schemaname,
    tablename,
    CASE 
        WHEN tablename IS NOT NULL THEN '✅ Table exists'
        ELSE '❌ Table missing'
    END as status
FROM pg_tables 
WHERE tablename IN ('community_groups', 'group_members', 'group_posts')
ORDER BY tablename;

-- 2. Check RLS status
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

-- 3. Check existing policies
SELECT 
    'Existing Policies' as check_type,
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

-- 4. Check table structure
SELECT 
    'Table Structure' as check_type,
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('community_groups', 'group_members', 'group_posts')
ORDER BY table_name, ordinal_position;

-- 5. Check if there's any data
SELECT 
    'Data Count' as check_type,
    'community_groups' as table_name,
    COUNT(*) as record_count
FROM community_groups
UNION ALL
SELECT 
    'Data Count' as check_type,
    'group_members' as table_name,
    COUNT(*) as record_count
FROM group_members
UNION ALL
SELECT 
    'Data Count' as check_type,
    'group_posts' as table_name,
    COUNT(*) as record_count
FROM group_posts;

-- 6. Check for any errors in the logs (if accessible)
-- This might not work in all Supabase setups
SELECT 
    'Error Check' as check_type,
    'Note: Check Supabase dashboard logs for detailed error messages' as message;

-- 7. Quick fix suggestion
SELECT 
    'Quick Fix' as check_type,
    'If you see circular dependencies in policies, run the fix-community-rls-policies.sql script' as suggestion;
