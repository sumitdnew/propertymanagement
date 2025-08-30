-- Create Sample Community Data for BA Property Manager
-- This script populates the community tables with realistic sample data

-- First, let's create some sample community groups
INSERT INTO community_groups (name, description, is_private, allow_invites, require_approval, max_members, building_id, created_by) VALUES
(
    'Building Announcements',
    'Important updates and announcements for all residents. Stay informed about building maintenance, events, and important notices.',
    false,
    true,
    false,
    200,
    (SELECT id FROM buildings LIMIT 1), -- Associate with first building
    (SELECT id FROM auth.users LIMIT 1) -- Created by first user
),
(
    'Neighborhood Watch',
    'Community safety and security discussions. Share information about suspicious activities and neighborhood safety tips.',
    false,
    true,
    false,
    150,
    (SELECT id FROM buildings LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1)
),
(
    'Social Events',
    'Planning and organizing community events. From potlucks to movie nights, let\'s make our building a fun place to live!',
    false,
    true,
    false,
    100,
    (SELECT id FROM buildings LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1)
),
(
    'Maintenance Tips',
    'Share tips and advice for home maintenance. Help each other with DIY projects and maintenance questions.',
    false,
    true,
    false,
    80,
    (SELECT id FROM buildings LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1)
),
(
    'Pet Owners Club',
    'A group for pet owners to share experiences, arrange playdates, and discuss pet-friendly building policies.',
    false,
    true,
    false,
    60,
    (SELECT id FROM buildings LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1)
),
(
    'Book Club',
    'Monthly book discussions and literary conversations. All reading levels welcome!',
    false,
    true,
    false,
    40,
    (SELECT id FROM buildings LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1)
),
(
    'Fitness & Wellness',
    'Group workouts, yoga sessions, and wellness tips. Let\'s stay healthy together!',
    false,
    true,
    false,
    70,
    (SELECT id FROM buildings LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1)
),
(
    'Private Building Staff',
    'Internal communication channel for building staff and management.',
    true,
    false,
    true,
    20,
    (SELECT id FROM buildings LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1)
);

-- Now let's add some members to these groups
-- First, let's get some user IDs to work with
DO $$
DECLARE
    user_ids UUID[];
    group_ids UUID[];
    i INTEGER;
    j INTEGER;
    random_user_id UUID;
    random_group_id UUID;
BEGIN
    -- Get array of user IDs
    SELECT array_agg(id) INTO user_ids FROM auth.users LIMIT 10;
    
    -- Get array of group IDs
    SELECT array_agg(id) INTO group_ids FROM community_groups;
    
    -- Add random members to groups
    FOR i IN 1..array_length(group_ids, 1) LOOP
        -- Each group gets 5-15 random members
        FOR j IN 1..(5 + floor(random() * 10)) LOOP
            random_user_id := user_ids[1 + floor(random() * array_length(user_ids, 1))];
            
            -- Insert member (ignore if already exists due to unique constraint)
            BEGIN
                INSERT INTO group_members (group_id, user_id, role) VALUES
                (
                    group_ids[i],
                    random_user_id,
                    CASE 
                        WHEN j = 1 THEN 'admin'  -- First member is admin
                        WHEN j <= 3 THEN 'moderator'  -- Next 2 are moderators
                        ELSE 'member'  -- Rest are regular members
                    END
                );
            EXCEPTION WHEN unique_violation THEN
                -- User already in group, skip
                NULL;
            END;
        END LOOP;
    END LOOP;
END $$;

-- Now let's add some sample posts to the groups
INSERT INTO group_posts (group_id, author_id, title, content) VALUES
-- Building Announcements posts
(
    (SELECT id FROM community_groups WHERE name = 'Building Announcements' LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1),
    'Welcome to our community!',
    'We\'re excited to have you as part of our building community. This group will be used for important announcements, maintenance updates, and building-wide information. Please check here regularly for updates!'
),
(
    (SELECT id FROM community_groups WHERE name = 'Building Announcements' LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1),
    'Monthly community meeting',
    'Join us this Friday at 7 PM in the common area for our monthly meeting. We\'ll discuss upcoming building improvements, community events, and address any concerns. Light refreshments will be provided!'
),
(
    (SELECT id FROM community_groups WHERE name = 'Building Announcements' LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1),
    'New security system installed',
    'We\'ve upgraded our building security system with new key fobs and enhanced door locks. Please visit the management office to pick up your new key fob. The old keys will be deactivated next week.'
),

-- Neighborhood Watch posts
(
    (SELECT id FROM community_groups WHERE name = 'Neighborhood Watch' LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1),
    'Suspicious activity reported',
    'A resident reported seeing someone loitering around the parking area last night around 11 PM. If you notice anything unusual, please report it immediately. Remember: if you see something, say something!'
),
(
    (SELECT id FROM community_groups WHERE name = 'Neighborhood Watch' LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1),
    'Safety reminder',
    'Please remember to always lock your doors and windows, even when you\'re home. Also, if you\'re going away, consider asking a neighbor to collect your mail and keep an eye on your apartment.'
),

-- Social Events posts
(
    (SELECT id FROM community_groups WHERE name = 'Social Events' LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1),
    'Summer BBQ planning',
    'Let\'s plan our annual summer BBQ! We\'re thinking of hosting it on the rooftop terrace. Who\'s interested in helping organize? We need volunteers for food, decorations, and setup. Ideas for activities are welcome too!'
),
(
    (SELECT id FROM community_groups WHERE name = 'Social Events' LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1),
    'Movie night this weekend',
    'Join us for movie night this Saturday at 8 PM in the common room. We\'ll be showing a family-friendly film. Bring your own snacks and drinks. Kids are welcome!'
),

-- Maintenance Tips posts
(
    (SELECT id FROM community_groups WHERE name = 'Maintenance Tips' LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1),
    'Quick fix for clogged drains',
    'If you have a slow drain, try this: mix 1/2 cup baking soda with 1/2 cup vinegar, pour it down the drain, let it sit for 15 minutes, then flush with hot water. This often works better than chemical cleaners!'
),
(
    (SELECT id FROM community_groups WHERE name = 'Maintenance Tips' LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1),
    'AC filter replacement reminder',
    'Don\'t forget to check your AC filters monthly and replace them every 3 months. Clean filters improve air quality and can save you money on energy bills. I found good deals at the hardware store on Main Street.'
),

-- Pet Owners Club posts
(
    (SELECT id FROM community_groups WHERE name = 'Pet Owners Club' LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1),
    'Dog playdate this weekend',
    'Anyone interested in a dog playdate this Saturday morning at the dog park? My golden retriever Max loves making new friends. We usually go around 10 AM. Let me know if you\'d like to join!'
),

-- Book Club posts
(
    (SELECT id FROM community_groups WHERE name = 'Book Club' LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1),
    'This month\'s book selection',
    'For our next meeting, we\'ll be discussing "The Midnight Library" by Matt Haig. It\'s a fascinating exploration of life choices and regrets. The meeting will be next Thursday at 7 PM in the common room.'
),

-- Fitness & Wellness posts
(
    (SELECT id FROM community_groups WHERE name = 'Fitness & Wellness' LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1),
    'Morning yoga sessions',
    'Starting next week, I\'ll be hosting morning yoga sessions on the rooftop terrace every Tuesday and Thursday at 7 AM. All levels welcome! Bring your own mat if you have one, or we can provide one. Let\'s start the day with some positive energy!'
);

-- Update the likes count for some posts to make them more realistic
UPDATE group_posts SET likes_count = floor(random() * 20) + 1 WHERE id IN (
    SELECT id FROM group_posts ORDER BY random() LIMIT 10
);

-- Display the created data
SELECT 'Community Groups Created:' as info;
SELECT name, description, is_private, member_count, post_count FROM (
    SELECT 
        cg.name,
        cg.description,
        cg.is_private,
        COUNT(DISTINCT gm.user_id) as member_count,
        COUNT(DISTINCT gp.id) as post_count
    FROM community_groups cg
    LEFT JOIN group_members gm ON cg.id = gm.group_id
    LEFT JOIN group_posts gp ON cg.id = gp.group_id
    GROUP BY cg.id, cg.name, cg.description, cg.is_private
    ORDER BY cg.name
) summary;

SELECT 'Sample Posts Created:' as info;
SELECT 
    cg.name as group_name,
    gp.title,
    LEFT(gp.content, 50) || '...' as content_preview,
    gp.likes_count,
    gp.created_at
FROM group_posts gp
JOIN community_groups cg ON gp.group_id = cg.id
ORDER BY gp.created_at DESC
LIMIT 10;
