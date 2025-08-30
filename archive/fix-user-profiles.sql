-- Fix User Profiles Script
-- This script creates profiles for actual authenticated users and cleans up orphaned profiles

-- 1. First, let's see what users we actually have
SELECT '=== ACTUAL AUTH USERS ===' as info;
SELECT 
    id,
    email,
    raw_user_meta_data->>'name' as name,
    raw_user_meta_data->>'user_type' as user_type,
    created_at
FROM auth.users
ORDER BY created_at;

-- 2. Clean up orphaned profiles (profiles without auth users)
DELETE FROM public.profiles 
WHERE id NOT IN (SELECT id FROM auth.users);

SELECT '=== ORPHANED PROFILES CLEANED ===' as info;

-- 3. Create profiles for actual authenticated users
INSERT INTO public.profiles (id, name, email, phone, apartment, user_type, building_id, created_at)
SELECT 
    au.id,
    COALESCE(au.raw_user_meta_data->>'name', 'User ' || au.id::text) as name,
    au.email,
    '+54 11 1234-5678' as phone,
    CASE 
        WHEN COALESCE(au.raw_user_meta_data->>'user_type', 'tenant') = 'tenant' THEN '1A'
        ELSE NULL 
    END as apartment,
    COALESCE(au.raw_user_meta_data->>'user_type', 'tenant') as user_type,
    '550e8400-e29b-41d4-a716-446655440001' as building_id,
    au.created_at
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

SELECT '=== PROFILES CREATED FOR AUTH USERS ===' as info;

-- 4. Show final result
SELECT '=== FINAL PROFILES ===' as info;
SELECT 
    p.id,
    p.name,
    p.email,
    p.user_type,
    p.building_id,
    p.created_at
FROM public.profiles p
ORDER BY p.created_at;

-- 5. Update businesses to use actual user IDs
-- First, let's see what businesses we have
SELECT '=== CURRENT BUSINESSES ===' as info;
SELECT 
    b.id,
    b.name,
    b.owner_id,
    p.name as owner_name,
    p.email as owner_email
FROM businesses b
LEFT JOIN public.profiles p ON b.owner_id = p.id;

-- 6. Update business owners to use actual authenticated users
UPDATE businesses 
SET owner_id = (
    SELECT id FROM auth.users 
    WHERE email = 'admin@ba-property.com' 
    LIMIT 1
)
WHERE name = 'Plomería Express';

UPDATE businesses 
SET owner_id = (
    SELECT id FROM auth.users 
    WHERE email = 'carlos.rodriguez@ba-property.com' 
    LIMIT 1
)
WHERE name = 'Electricidad Segura';

UPDATE businesses 
SET owner_id = (
    SELECT id FROM auth.users 
    WHERE email = 'ana.martinez@ba-property.com' 
    LIMIT 1
)
WHERE name = 'Limpieza Pro';

UPDATE businesses 
SET owner_id = (
    SELECT id FROM auth.users 
    WHERE email = 'admin@ba-property.com' 
    LIMIT 1
)
WHERE name = 'Jardines Verdes';

UPDATE businesses 
SET owner_id = (
    SELECT id FROM auth.users 
    WHERE email = 'carlos.rodriguez@ba-property.com' 
    LIMIT 1
)
WHERE name = 'Seguridad Total';

SELECT '=== BUSINESSES UPDATED ===' as info;

-- 7. Update maintenance requests to use actual user IDs
UPDATE maintenance_requests 
SET requester_id = (
    SELECT id FROM auth.users 
    WHERE email = 'juan.perez@ba-property.com' 
    LIMIT 1
)
WHERE title = 'Fuga de agua en baño';

UPDATE maintenance_requests 
SET requester_id = (
    SELECT id FROM auth.users 
    WHERE email = 'laura.fernandez@ba-property.com' 
    LIMIT 1
)
WHERE title = 'Luz del pasillo no funciona';

UPDATE maintenance_requests 
SET requester_id = (
    SELECT id FROM auth.users 
    WHERE email = 'roberto.silva@ba-property.com' 
    LIMIT 1
)
WHERE title = 'Ascensor con ruidos';

UPDATE maintenance_requests 
SET requester_id = (
    SELECT id FROM auth.users 
    WHERE email = 'patricia.lopez@ba-property.com' 
    LIMIT 1
)
WHERE title = 'Limpieza de terraza';

UPDATE maintenance_requests 
SET requester_id = (
    SELECT id FROM auth.users 
    WHERE email = 'miguel.torres@ba-property.com' 
    LIMIT 1
)
WHERE title = 'Reparación de persiana';

UPDATE maintenance_requests 
SET requester_id = (
    SELECT id FROM auth.users 
    WHERE email = 'carmen.ruiz@ba-property.com' 
    LIMIT 1
)
WHERE title = 'Problema de calefacción';

UPDATE maintenance_requests 
SET requester_id = (
    SELECT id FROM auth.users 
    WHERE email = 'juan.perez@ba-property.com' 
    LIMIT 1
)
WHERE title = 'Limpieza de ventanas';

UPDATE maintenance_requests 
SET requester_id = (
    SELECT id FROM auth.users 
    WHERE email = 'laura.fernandez@ba-property.com' 
    LIMIT 1
)
WHERE title = 'Reparación de cerradura';

SELECT '=== MAINTENANCE REQUESTS UPDATED ===' as info;

-- 8. Update payments to use actual user IDs
UPDATE payments 
SET tenant_id = (
    SELECT id FROM auth.users 
    WHERE email = 'juan.perez@ba-property.com' 
    LIMIT 1
)
WHERE apartment = '3A';

UPDATE payments 
SET tenant_id = (
    SELECT id FROM auth.users 
    WHERE email = 'laura.fernandez@ba-property.com' 
    LIMIT 1
)
WHERE apartment = '5B';

UPDATE payments 
SET tenant_id = (
    SELECT id FROM auth.users 
    WHERE email = 'roberto.silva@ba-property.com' 
    LIMIT 1
)
WHERE apartment = '2C';

UPDATE payments 
SET tenant_id = (
    SELECT id FROM auth.users 
    WHERE email = 'patricia.lopez@ba-property.com' 
    LIMIT 1
)
WHERE apartment = '1A';

UPDATE payments 
SET tenant_id = (
    SELECT id FROM auth.users 
    WHERE email = 'miguel.torres@ba-property.com' 
    LIMIT 1
)
WHERE apartment = '4B';

UPDATE payments 
SET tenant_id = (
    SELECT id FROM auth.users 
    WHERE email = 'carmen.ruiz@ba-property.com' 
    LIMIT 1
)
WHERE apartment = '6A';

SELECT '=== PAYMENTS UPDATED ===' as info;

-- 9. Update community posts to use actual user IDs
UPDATE community_posts 
SET author_id = (
    SELECT id FROM auth.users 
    WHERE email = 'admin@ba-property.com' 
    LIMIT 1
)
WHERE title = 'Bienvenidos al edificio';

UPDATE community_posts 
SET author_id = (
    SELECT id FROM auth.users 
    WHERE email = 'carlos.rodriguez@ba-property.com' 
    LIMIT 1
)
WHERE title = 'Reunión de consorcio';

UPDATE community_posts 
SET author_id = (
    SELECT id FROM auth.users 
    WHERE email = 'ana.martinez@ba-property.com' 
    LIMIT 1
)
WHERE title = 'Mascotas en el edificio';

UPDATE community_posts 
SET author_id = (
    SELECT id FROM auth.users 
    WHERE email = 'admin@ba-property.com' 
    LIMIT 1
)
WHERE title = 'Mantenimiento del ascensor';

UPDATE community_posts 
SET author_id = (
    SELECT id FROM auth.users 
    WHERE email = 'juan.perez@ba-property.com' 
    LIMIT 1
)
WHERE title = 'Fiesta en el salón común';

UPDATE community_posts 
SET author_id = (
    SELECT id FROM auth.users 
    WHERE email = 'laura.fernandez@ba-property.com' 
    LIMIT 1
)
WHERE title = 'Nuevo vecino';

UPDATE community_posts 
SET author_id = (
    SELECT id FROM auth.users 
    WHERE email = 'admin@ba-property.com' 
    LIMIT 1
)
WHERE title = 'Limpieza de la terraza';

UPDATE community_posts 
SET author_id = (
    SELECT id FROM auth.users 
    WHERE email = 'carlos.rodriguez@ba-property.com' 
    LIMIT 1
)
WHERE title = 'Horarios de la pileta';

SELECT '=== COMMUNITY POSTS UPDATED ===' as info;

-- 10. Final summary
SELECT '✅ ALL DATA SYNCED WITH ACTUAL USERS!' as message;
SELECT '📊 Final Summary:' as summary;
SELECT '👥 Profiles: ' || COUNT(*) as profiles FROM public.profiles;
SELECT '🏪 Businesses: ' || COUNT(*) as businesses FROM businesses;
SELECT '🔧 Maintenance Requests: ' || COUNT(*) as maintenance_requests FROM maintenance_requests;
SELECT '💰 Payments: ' || COUNT(*) as payments FROM payments;
SELECT '📝 Community Posts: ' || COUNT(*) as community_posts FROM community_posts;
