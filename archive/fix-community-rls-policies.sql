-- Fix Community RLS Policies - Circular Dependency Issue
-- This script fixes the RLS policies that are causing HTTP 500 errors

-- First, let's check the current RLS status
SELECT 
    'Current RLS Status' as check_type,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('community_groups', 'group_members', 'group_posts')
ORDER BY tablename;

-- Check existing policies
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

-- Step 1: Drop ALL existing policies to avoid conflicts
-- Drop policies for community_groups
DROP POLICY IF EXISTS "Users can view public groups and groups they're members of" ON community_groups;
DROP POLICY IF EXISTS "Users can create groups" ON community_groups;
DROP POLICY IF EXISTS "Group admins can update their groups" ON community_groups;
DROP POLICY IF EXISTS "Group admins can delete their groups" ON community_groups;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON community_groups;

-- Drop policies for group_members
DROP POLICY IF EXISTS "Users can view members of groups they're in" ON group_members;
DROP POLICY IF EXISTS "Users can join public groups" ON group_members;
DROP POLICY IF EXISTS "Users can leave groups they're in" ON group_members;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON group_members;

-- Drop policies for group_posts
DROP POLICY IF EXISTS "Users can view posts in groups they're members of" ON group_posts;
DROP POLICY IF EXISTS "Group members can create posts" ON group_posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON group_posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON group_posts;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON group_posts;

-- Step 2: Create simplified, non-circular policies for community_groups
CREATE POLICY "Enable read access for authenticated users" ON community_groups
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create groups" ON community_groups
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group admins can update their groups" ON community_groups
    FOR UPDATE USING (
        id IN (
            SELECT group_id FROM group_members 
            WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
        )
    );

CREATE POLICY "Group admins can delete their groups" ON community_groups
    FOR DELETE USING (
        id IN (
            SELECT group_id FROM group_members 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Step 3: Create simplified, non-circular policies for group_members
CREATE POLICY "Enable read access for authenticated users" ON group_members
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can join public groups" ON group_members
    FOR INSERT WITH CHECK (
        group_id IN (
            SELECT id FROM community_groups 
            WHERE NOT is_private AND 
                  (max_members IS NULL OR 
                   (SELECT COUNT(*) FROM group_members WHERE group_id = id) < max_members)
        )
    );

CREATE POLICY "Users can leave groups they're in" ON group_members
    FOR DELETE USING (user_id = auth.uid());

-- Step 4: Create simplified policies for group_posts
CREATE POLICY "Enable read access for authenticated users" ON group_posts
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Group members can create posts" ON group_posts
    FOR INSERT WITH CHECK (
        group_id IN (
            SELECT group_id FROM group_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own posts" ON group_posts
    FOR UPDATE USING (author_id = auth.uid());

CREATE POLICY "Users can delete their own posts" ON group_posts
    FOR DELETE USING (author_id = auth.uid());

-- Step 5: Verify the new policies
SELECT 
    'New Policies' as check_type,
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

-- Step 6: Test the policies by checking if they're working
SELECT 
    'Policy Test' as check_type,
    'community_groups' as table_name,
    COUNT(*) as total_groups
FROM community_groups;

SELECT 
    'Policy Test' as check_type,
    'group_members' as table_name,
    COUNT(*) as total_members
FROM group_members;

-- Step 7: If you want to temporarily disable RLS for testing (uncomment if needed)
-- ALTER TABLE community_groups DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE group_members DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE group_posts DISABLE ROW LEVEL SECURITY;

-- Step 8: If you want to re-enable RLS after testing (uncomment if needed)
-- ALTER TABLE community_groups ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE group_posts ENABLE ROW LEVEL SECURITY;
