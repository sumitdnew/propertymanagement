-- Create Community Tables for BA Property Manager (Safe Version)
-- This script sets up the community functionality with groups, members, and posts
-- Safe to run multiple times - will not fail if objects already exist

-- 1. Create community_groups table
CREATE TABLE IF NOT EXISTS community_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    is_private BOOLEAN DEFAULT false,
    allow_invites BOOLEAN DEFAULT true,
    require_approval BOOLEAN DEFAULT false,
    max_members INTEGER DEFAULT 100,
    building_id UUID REFERENCES buildings(id) ON DELETE SET NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT community_groups_name_length CHECK (char_length(name) >= 3 AND char_length(name) <= 100),
    CONSTRAINT community_groups_description_length CHECK (char_length(description) >= 10 AND char_length(description) <= 500),
    CONSTRAINT community_groups_max_members CHECK (max_members >= 2 AND max_members <= 1000)
);

-- 2. Create group_members table
CREATE TABLE IF NOT EXISTS group_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID REFERENCES community_groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_approved BOOLEAN DEFAULT true,
    
    -- Ensure unique user per group
    UNIQUE(group_id, user_id)
);

-- 3. Create group_posts table
CREATE TABLE IF NOT EXISTS group_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID REFERENCES community_groups(id) ON DELETE CASCADE,
    author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT group_posts_title_length CHECK (char_length(title) >= 1 AND char_length(title) <= 200),
    CONSTRAINT group_posts_content_length CHECK (char_length(content) >= 1 AND char_length(content) <= 5000)
);

-- 4. Create indexes for better performance (IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_community_groups_building_id ON community_groups(building_id);
CREATE INDEX IF NOT EXISTS idx_community_groups_created_by ON community_groups(created_by);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_posts_group_id ON group_posts(group_id);
CREATE INDEX IF NOT EXISTS idx_group_posts_author_id ON group_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_group_posts_created_at ON group_posts(created_at);

-- 5. Enable Row Level Security (RLS) - safe to run multiple times
ALTER TABLE community_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_posts ENABLE ROW LEVEL SECURITY;

-- 6. Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view public groups and groups they're members of" ON community_groups;
DROP POLICY IF EXISTS "Users can create groups" ON community_groups;
DROP POLICY IF EXISTS "Group admins can update their groups" ON community_groups;
DROP POLICY IF EXISTS "Group admins can delete their groups" ON community_groups;

DROP POLICY IF EXISTS "Users can view members of groups they're in" ON group_members;
DROP POLICY IF EXISTS "Users can join public groups" ON group_members;
DROP POLICY IF EXISTS "Users can leave groups they're in" ON group_members;

DROP POLICY IF EXISTS "Users can view posts in groups they're members of" ON group_posts;
DROP POLICY IF EXISTS "Group members can create posts" ON group_posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON group_posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON group_posts;

-- 7. Create RLS policies for community_groups
CREATE POLICY "Users can view public groups and groups they're members of" ON community_groups
    FOR SELECT USING (
        NOT is_private OR 
        id IN (
            SELECT group_id FROM group_members WHERE user_id = auth.uid()
        )
    );

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

-- 8. Create RLS policies for group_members
CREATE POLICY "Users can view members of groups they're in" ON group_members
    FOR SELECT USING (
        group_id IN (
            SELECT id FROM community_groups 
            WHERE NOT is_private OR 
                  id IN (
                      SELECT group_id FROM group_members WHERE user_id = auth.uid()
                  )
        )
    );

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

-- 9. Create RLS policies for group_posts
CREATE POLICY "Users can view posts in groups they're members of" ON group_posts
    FOR SELECT USING (
        group_id IN (
            SELECT group_id FROM group_members WHERE user_id = auth.uid()
        )
    );

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

-- 10. Create function to update updated_at timestamp (safe to run multiple times)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 11. Drop existing triggers if they exist (to avoid conflicts)
DROP TRIGGER IF EXISTS update_community_groups_updated_at ON community_groups;
DROP TRIGGER IF EXISTS update_group_posts_updated_at ON group_posts;

-- 12. Create triggers for updated_at
CREATE TRIGGER update_community_groups_updated_at 
    BEFORE UPDATE ON community_groups 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_group_posts_updated_at 
    BEFORE UPDATE ON group_posts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 13. Grant permissions to authenticated users (safe to run multiple times)
GRANT SELECT, INSERT, UPDATE, DELETE ON community_groups TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON group_members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON group_posts TO authenticated;

-- 14. Grant usage on sequences (safe to run multiple times)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 15. Display success message
SELECT 'Community tables created/updated successfully!' as status;
