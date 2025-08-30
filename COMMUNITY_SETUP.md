# Community Functionality Setup Guide

This guide will help you set up the community functionality in your BA Property Manager application.

## 🗄️ Database Setup

### Step 1: Create Community Tables
Run the SQL script to create the necessary database tables:

```sql
-- Run this file in your Supabase SQL editor
-- File: archive/create-community-tables-safe.sql
```

**Note:** Use the "safe" version to avoid errors if you've already run the script before.

This will create:
- `community_groups` - Stores community group information
- `group_members` - Tracks group membership and roles
- `group_posts` - Stores posts within groups
- Proper indexes and RLS policies

### Step 2: Populate Sample Data
Run the sample data script to populate with realistic community data:

```sql
-- Run this file in your Supabase SQL editor
-- File: archive/create-community-sample-data-safe.sql
```

**Note:** Use the "safe" version to avoid creating duplicate data if you've already run the script before.

This will create:
- 8 sample community groups
- Sample members for each group
- Sample posts with realistic content

## 🔧 Code Updates

The following components have been updated to use real data:

### Community.jsx
- ✅ `fetchGroups()` - Fetches real groups from Supabase
- ✅ `fetchGroupPosts()` - Fetches real posts from Supabase
- ✅ `handleJoinGroup()` - Adds users to groups via Supabase
- ✅ `handleLeaveGroup()` - Removes users from groups via Supabase

### CommunityCreation.jsx
- ✅ `handleSubmit()` - Creates real groups in Supabase
- ✅ Creates welcome post automatically
- ✅ Adds creator as admin member

## 🚀 Testing the Community Functionality

### 1. Create a New Community Group
1. Navigate to the Community tab in either dashboard
2. Click "Create Group" button
3. Fill out the form with:
   - Group name (3-50 characters)
   - Description (10-500 characters)
   - Privacy settings
   - Group settings
4. Submit the form

### 2. Join/Leave Groups
1. View available groups in the Community tab
2. Click "Join Group" for groups you're not a member of
3. Click "Leave" to leave groups you're a member of
4. View posts by clicking "View Posts"

### 3. View Community Posts
1. Click on any group to view its posts
2. Posts are automatically loaded from the database
3. Each post shows author, content, and engagement metrics

## 🔒 Security Features

The community system includes:

- **Row Level Security (RLS)** - Users can only see groups they're members of or public groups
- **Role-based Access** - Admin, moderator, and member roles with different permissions
- **Building Association** - Groups can be associated with specific buildings
- **Privacy Controls** - Public and private group options

## 🐛 Troubleshooting

### Common Issues:

1. **"No groups found"**
   - Check if the community tables were created successfully
   - Verify RLS policies are in place
   - Check browser console for errors

2. **"Permission denied"**
   - Ensure user is authenticated
   - Check if user has a profile in the `profiles` table
   - Verify RLS policies are working correctly

3. **Groups not loading**
   - Check Supabase connection
   - Verify table names match exactly (`community_groups`, `group_members`, `group_posts`)
   - Check browser console for SQL errors

### Debug Steps:

1. **Check Database Tables:**
   ```sql
   SELECT * FROM community_groups LIMIT 5;
   SELECT * FROM group_members LIMIT 5;
   SELECT * FROM group_posts LIMIT 5;
   ```

2. **Check RLS Status:**
   ```sql
   SELECT schemaname, tablename, rowsecurity 
   FROM pg_tables 
   WHERE tablename IN ('community_groups', 'group_members', 'group_posts');
   ```

3. **Check User Permissions:**
   ```sql
   SELECT * FROM auth.users LIMIT 5;
   SELECT * FROM profiles LIMIT 5;
   ```

## 📱 Features Available

### For Tenants:
- ✅ View public and building-specific groups
- ✅ Join/leave groups
- ✅ View group posts
- ✅ Create new community groups

### For Property Managers:
- ✅ All tenant features
- ✅ Manage group settings
- ✅ Moderate group content
- ✅ Create official building groups

## 🔮 Future Enhancements

Potential features to add:
- Group invitations system
- Post comments and replies
- Group moderation tools
- File sharing within groups
- Group events and calendar
- Push notifications for group activity

## 📞 Support

If you encounter issues:
1. Check the browser console for JavaScript errors
2. Check the Supabase logs for database errors
3. Verify all SQL scripts ran successfully
4. Ensure your Supabase connection is working

---

**Happy Community Building! 🎉**
