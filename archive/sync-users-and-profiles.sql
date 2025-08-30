-- Sync Users and Profiles Script
-- This script helps identify and sync users between auth.users and public.profiles

-- 1. Check what users exist in auth.users
SELECT '=== AUTH USERS ===' as info;
SELECT 
    id,
    email,
    raw_user_meta_data->>'name' as name,
    created_at,
    email_confirmed_at
FROM auth.users
ORDER BY created_at;

-- 2. Check what profiles exist in public.profiles
SELECT '=== PUBLIC PROFILES ===' as info;
SELECT 
    id,
    name,
    email,
    user_type,
    building_id,
    created_at
FROM public.profiles
ORDER BY created_at;

-- 3. Find users that exist in auth but not in profiles
SELECT '=== USERS WITHOUT PROFILES ===' as info;
SELECT 
    au.id,
    au.email,
    au.raw_user_meta_data->>'name' as name,
    au.created_at
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- 4. Find profiles that exist but don't have corresponding auth users
SELECT '=== ORPHANED PROFILES ===' as info;
SELECT 
    p.id,
    p.name,
    p.email,
    p.user_type,
    p.created_at
FROM public.profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE au.id IS NULL;

-- 5. Create profiles for users that don't have them
-- (This will be commented out - uncomment and run separately if needed)
/*
INSERT INTO public.profiles (id, name, email, phone, apartment, user_type, building_id, created_at)
SELECT 
    au.id,
    COALESCE(au.raw_user_meta_data->>'name', 'User ' || au.id::text) as name,
    au.email,
    '+54 11 1234-5678' as phone,
    CASE 
        WHEN au.raw_user_meta_data->>'user_type' = 'tenant' THEN '1A'
        ELSE NULL 
    END as apartment,
    COALESCE(au.raw_user_meta_data->>'user_type', 'tenant') as user_type,
    '550e8400-e29b-41d4-a716-446655440001' as building_id,
    au.created_at
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;
*/
