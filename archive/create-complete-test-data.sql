-- Complete Test Data Creation Script for BA Property Manager
-- This script creates comprehensive test data for all tables

-- First, clear existing data (in reverse dependency order)
DELETE FROM group_posts;
DELETE FROM group_members;
DELETE FROM groups;
DELETE FROM invitations;
DELETE FROM payments;
DELETE FROM community_posts;
DELETE FROM maintenance_requests;
DELETE FROM businesses;
DELETE FROM business_categories;
DELETE FROM profiles;
DELETE FROM buildings;

-- 1. CREATE BUILDINGS
-- ===================
INSERT INTO buildings (id, name, address, description, security_code, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Torre Central', 'Av. Corrientes 1234, Buenos Aires', 'Modern residential tower in the heart of Buenos Aires', 'TC2024', NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'Edificio Palermo', 'Av. Santa Fe 5678, Buenos Aires', 'Luxury building in Palermo neighborhood', 'EP2024', NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'Residencial Belgrano', 'Av. Cabildo 9012, Buenos Aires', 'Family-friendly building in Belgrano', 'RB2024', NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'Torre Microcentro', 'Av. 9 de Julio 3456, Buenos Aires', 'Premium building in the financial district', 'TM2024', NOW()),
('550e8400-e29b-41d4-a716-446655440005', 'Edificio Recoleta', 'Av. Alvear 7890, Buenos Aires', 'Exclusive building in Recoleta', 'ER2024', NOW());

-- 2. CREATE USER PROFILES (These should match the users created via TestUserCreator)
-- ================================================================================
INSERT INTO profiles (id, name, email, phone, apartment, user_type, building_id, created_at) VALUES
('1f98af3b-39d2-46d1-ac54-11d24b48e0c6', 'María González', 'admin@ba-property.com', '+54 11 1234-5678', NULL, 'property-manager', '550e8400-e29b-41d4-a716-446655440001', NOW()),
('ab85f2c0-0726-4121-b692-a72c82b2a504', 'Carlos Rodríguez', 'carlos.rodriguez@ba-property.com', '+54 11 2345-6789', NULL, 'building-owner', '550e8400-e29b-41d4-a716-446655440002', NOW()),
('a7ac335c-836f-4c91-b8c5-b0a80bf9cafe', 'Ana Martínez', 'ana.martinez@ba-property.com', '+54 11 3456-7890', NULL, 'property-manager', '550e8400-e29b-41d4-a716-446655440003', NOW()),
('112d0476-76f7-4c40-bba7-b8f11661f639', 'Juan Pérez', 'juan.perez@ba-property.com', '+54 11 4567-8901', '3A', 'tenant', '550e8400-e29b-41d4-a716-446655440001', NOW()),
('0daf4e1d-3985-4460-a7c2-9cc0ec63f038', 'Laura Fernández', 'laura.fernandez@ba-property.com', '+54 11 5678-9012', '5B', 'tenant', '550e8400-e29b-41d4-a716-446655440001', NOW()),
('064cb549-74f8-4c21-ae5c-e621d120ed47', 'Roberto Silva', 'roberto.silva@ba-property.com', '+54 11 6789-0123', '2C', 'tenant', '550e8400-e29b-41d4-a716-446655440001', NOW()),
('29f72951-7c44-4c71-abe2-f1031db3456f', 'Patricia López', 'patricia.lopez@ba-property.com', '+54 11 7890-1234', '1A', 'tenant', '550e8400-e29b-41d4-a716-446655440002', NOW()),
('8e58b0ff-6a16-4fc8-b79d-837337e97b5c', 'Miguel Torres', 'miguel.torres@ba-property.com', '+54 11 8901-2345', '4B', 'tenant', '550e8400-e29b-41d4-a716-446655440002', NOW()),
('4f943ef0-0d8f-4b97-97c4-4659b1a2016b', 'Carmen Ruiz', 'carmen.ruiz@ba-property.com', '+54 11 9012-3456', '6A', 'tenant', '550e8400-e29b-41d4-a716-446655440003', NOW());

-- 3. CREATE BUSINESS CATEGORIES
-- =============================
INSERT INTO business_categories (id, name, description, icon, color, sort_order, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440101', 'Plomería', 'Servicios de plomería y fontanería', 'wrench', '#84CC16', 1, NOW()),
('550e8400-e29b-41d4-a716-446655440102', 'Electricidad', 'Servicios eléctricos y mantenimiento', 'zap', '#F59E0B', 2, NOW()),
('550e8400-e29b-41d4-a716-446655440103', 'Limpieza', 'Servicios de limpieza y mantenimiento', 'sparkles', '#06B6D4', 3, NOW()),
('550e8400-e29b-41d4-a716-446655440104', 'Jardinería', 'Servicios de jardinería y paisajismo', 'flower', '#10B981', 4, NOW()),
('550e8400-e29b-41d4-a716-446655440105', 'Seguridad', 'Servicios de seguridad y vigilancia', 'shield', '#EF4444', 5, NOW()),
('550e8400-e29b-41d4-a716-446655440106', 'Pintura', 'Servicios de pintura y decoración', 'palette', '#8B5CF6', 6, NOW()),
('550e8400-e29b-41d4-a716-446655440107', 'Carpintería', 'Servicios de carpintería y madera', 'hammer', '#A855F7', 7, NOW()),
('550e8400-e29b-41d4-a716-446655440108', 'Albañilería', 'Servicios de albañilería y construcción', 'building', '#6B7280', 8, NOW());

-- 4. CREATE BUSINESSES
-- ====================
INSERT INTO businesses (id, name, description, phone, email, address, category_id, owner_id, status, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440201', 'Plomería Express', 'Servicios de plomería 24/7', '+54 11 1234-5678', 'plomeria@ba-property.com', 'Av. Corrientes 1000, BA', '550e8400-e29b-41d4-a716-446655440101', '1f98af3b-39d2-46d1-ac54-11d24b48e0c6', 'approved', NOW()),
('550e8400-e29b-41d4-a716-446655440202', 'Electricidad Segura', 'Instalaciones eléctricas certificadas', '+54 11 2345-6789', 'electricidad@ba-property.com', 'Av. Santa Fe 2000, BA', '550e8400-e29b-41d4-a716-446655440102', 'ab85f2c0-0726-4121-b692-a72c82b2a504', 'approved', NOW()),
('550e8400-e29b-41d4-a716-446655440203', 'Limpieza Pro', 'Servicios de limpieza profesional', '+54 11 3456-7890', 'limpieza@ba-property.com', 'Av. Cabildo 3000, BA', '550e8400-e29b-41d4-a716-446655440103', 'a7ac335c-836f-4c91-b8c5-b0a80bf9cafe', 'approved', NOW()),
('550e8400-e29b-41d4-a716-446655440204', 'Jardines Verdes', 'Diseño y mantenimiento de jardines', '+54 11 4567-8901', 'jardines@ba-property.com', 'Av. 9 de Julio 4000, BA', '550e8400-e29b-41d4-a716-446655440104', '1f98af3b-39d2-46d1-ac54-11d24b48e0c6', 'approved', NOW()),
('550e8400-e29b-41d4-a716-446655440205', 'Seguridad Total', 'Servicios de seguridad integral', '+54 11 5678-9012', 'seguridad@ba-property.com', 'Av. Alvear 5000, BA', '550e8400-e29b-41d4-a716-446655440105', 'ab85f2c0-0726-4121-b692-a72c82b2a504', 'approved', NOW());

-- 5. CREATE MAINTENANCE REQUESTS
-- ===============================
INSERT INTO maintenance_requests (id, title, description, priority, status, requester_id, building_id, assigned_to, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440301', 'Fuga de agua en baño', 'Hay una fuga de agua en el grifo del baño principal', 'high', 'pending', '112d0476-76f7-4c40-bba7-b8f11661f639', '550e8400-e29b-41d4-a716-446655440001', '1f98af3b-39d2-46d1-ac54-11d24b48e0c6', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440302', 'Luz del pasillo no funciona', 'La luz del pasillo del 5to piso no enciende', 'medium', 'in_progress', '0daf4e1d-3985-4460-a7c2-9cc0ec63f038', '550e8400-e29b-41d4-a716-446655440001', 'ab85f2c0-0726-4121-b692-a72c82b2a504', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440303', 'Ascensor con ruidos', 'El ascensor hace ruidos extraños al subir', 'low', 'completed', '064cb549-74f8-4c21-ae5c-e621d120ed47', '550e8400-e29b-41d4-a716-446655440001', 'a7ac335c-836f-4c91-b8c5-b0a80bf9cafe', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440304', 'Limpieza de terraza', 'Necesito limpieza de la terraza compartida', 'medium', 'pending', '29f72951-7c44-4c71-abe2-f1031db3456f', '550e8400-e29b-41d4-a716-446655440002', '1f98af3b-39d2-46d1-ac54-11d24b48e0c6', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440305', 'Reparación de persiana', 'La persiana del living no sube correctamente', 'low', 'in_progress', '8e58b0ff-6a16-4fc8-b79d-837337e97b5c', '550e8400-e29b-41d4-a716-446655440002', 'ab85f2c0-0726-4121-b692-a72c82b2a504', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440306', 'Problema de calefacción', 'No funciona la calefacción en el dormitorio', 'high', 'pending', '4f943ef0-0d8f-4b97-97c4-4659b1a2016b', '550e8400-e29b-41d4-a716-446655440003', 'a7ac335c-836f-4c91-b8c5-b0a80bf9cafe', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440307', 'Limpieza de ventanas', 'Solicito limpieza de todas las ventanas', 'medium', 'completed', '112d0476-76f7-4c40-bba7-b8f11661f639', '550e8400-e29b-41d4-a716-446655440001', '1f98af3b-39d2-46d1-ac54-11d24b48e0c6', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440308', 'Reparación de cerradura', 'La cerradura de la puerta principal está trabada', 'high', 'pending', '0daf4e1d-3985-4460-a7c2-9cc0ec63f038', '550e8400-e29b-41d4-a716-446655440001', 'ab85f2c0-0726-4121-b692-a72c82b2a504', NOW(), NOW());

-- 6. CREATE PAYMENTS
-- ==================
INSERT INTO payments (id, tenant_id, building_id, apartment, amount, payment_type, due_date, status, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440401', '112d0476-76f7-4c40-bba7-b8f11661f639', '550e8400-e29b-41d4-a716-446655440001', '3A', 150000, 'rent', '2024-01-01', 'paid', NOW()),
('550e8400-e29b-41d4-a716-446655440402', '0daf4e1d-3985-4460-a7c2-9cc0ec63f038', '550e8400-e29b-41d4-a716-446655440001', '5B', 180000, 'rent', '2024-01-01', 'paid', NOW()),
('550e8400-e29b-41d4-a716-446655440403', '064cb549-74f8-4c21-ae5c-e621d120ed47', '550e8400-e29b-41d4-a716-446655440001', '2C', 160000, 'rent', '2024-01-01', 'pending', NOW()),
('550e8400-e29b-41d4-a716-446655440404', '29f72951-7c44-4c71-abe2-f1031db3456f', '550e8400-e29b-41d4-a716-446655440002', '1A', 200000, 'rent', '2024-01-01', 'paid', NOW()),
('550e8400-e29b-41d4-a716-446655440405', '8e58b0ff-6a16-4fc8-b79d-837337e97b5c', '550e8400-e29b-41d4-a716-446655440002', '4B', 175000, 'rent', '2024-01-01', 'paid', NOW()),
('550e8400-e29b-41d4-a716-446655440406', '4f943ef0-0d8f-4b97-97c4-4659b1a2016b', '550e8400-e29b-41d4-a716-446655440003', '6A', 190000, 'rent', '2024-01-01', 'pending', NOW()),
('550e8400-e29b-41d4-a716-446655440407', '112d0476-76f7-4c40-bba7-b8f11661f639', '550e8400-e29b-41d4-a716-446655440001', '3A', 25000, 'utilities', '2024-01-15', 'paid', NOW()),
('550e8400-e29b-41d4-a716-446655440408', '0daf4e1d-3985-4460-a7c2-9cc0ec63f038', '550e8400-e29b-41d4-a716-446655440001', '5B', 30000, 'utilities', '2024-01-15', 'pending', NOW());

-- 7. CREATE COMMUNITY POSTS
-- =========================
INSERT INTO community_posts (id, title, content, author_id, building_id, post_type, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440501', 'Bienvenidos al edificio', '¡Hola a todos! Les doy la bienvenida a nuestro edificio. Espero que todos nos llevemos bien.', '1f98af3b-39d2-46d1-ac54-11d24b48e0c6', '550e8400-e29b-41d4-a716-446655440001', 'announcement', NOW()),
('550e8400-e29b-41d4-a716-446655440502', 'Reunión de consorcio', 'Recordatorio: Reunión de consorcio el próximo viernes a las 19:00 en el salón común.', 'ab85f2c0-0726-4121-b692-a72c82b2a504', '550e8400-e29b-41d4-a716-446655440001', 'announcement', NOW()),
('550e8400-e29b-41d4-a716-446655440503', 'Mascotas en el edificio', 'Recordatorio: Las mascotas deben estar con correa en las áreas comunes.', 'a7ac335c-836f-4c91-b8c5-b0a80bf9cafe', '550e8400-e29b-41d4-a716-446655440001', 'announcement', NOW()),
('550e8400-e29b-41d4-a716-446655440504', 'Mantenimiento del ascensor', 'El ascensor estará en mantenimiento mañana de 9:00 a 12:00. Disculpen las molestias.', '1f98af3b-39d2-46d1-ac54-11d24b48e0c6', '550e8400-e29b-41d4-a716-446655440001', 'announcement', NOW()),
('550e8400-e29b-41d4-a716-446655440505', 'Fiesta en el salón común', '¡Invitamos a todos a la fiesta de fin de año en el salón común!', '112d0476-76f7-4c40-bba7-b8f11661f639', '550e8400-e29b-41d4-a716-446655440001', 'event', NOW()),
('550e8400-e29b-41d4-a716-446655440506', 'Nuevo vecino', 'Bienvenido al nuevo vecino del departamento 4B. ¡Esperamos conocerlo pronto!', '0daf4e1d-3985-4460-a7c2-9cc0ec63f038', '550e8400-e29b-41d4-a716-446655440001', 'general', NOW()),
('550e8400-e29b-41d4-a716-446655440507', 'Limpieza de la terraza', 'La terraza será limpiada el próximo lunes. Por favor, retiren sus pertenencias.', '1f98af3b-39d2-46d1-ac54-11d24b48e0c6', '550e8400-e29b-41d4-a716-446655440002', 'announcement', NOW()),
('550e8400-e29b-41d4-a716-446655440508', 'Horarios de la pileta', 'Recordatorio: La pileta está abierta de 8:00 a 22:00. Respeten los horarios.', 'ab85f2c0-0726-4121-b692-a72c82b2a504', '550e8400-e29b-41d4-a716-446655440002', 'announcement', NOW());

-- 8. CREATE GROUPS
-- ================
INSERT INTO groups (id, name, description, building_id, created_by, is_private, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440601', 'Vecinos Activos', 'Grupo para vecinos que quieren participar en actividades del edificio', '550e8400-e29b-41d4-a716-446655440001', '1f98af3b-39d2-46d1-ac54-11d24b48e0c6', false, NOW()),
('550e8400-e29b-41d4-a716-446655440602', 'Mascotas del Edificio', 'Grupo para dueños de mascotas del edificio', '550e8400-e29b-41d4-a716-446655440001', '112d0476-76f7-4c40-bba7-b8f11661f639', false, NOW()),
('550e8400-e29b-41d4-a716-446655440603', 'Jardineros Urbanos', 'Grupo para compartir tips de jardinería en balcones', '550e8400-e29b-41d4-a716-446655440002', '29f72951-7c44-4c71-abe2-f1031db3456f', false, NOW()),
('550e8400-e29b-41d4-a716-446655440604', 'Deportistas del Edificio', 'Grupo para organizar actividades deportivas', '550e8400-e29b-41d4-a716-446655440003', '4f943ef0-0d8f-4b97-97c4-4659b1a2016b', false, NOW());

-- 9. CREATE GROUP MEMBERSHIPS
-- ============================
INSERT INTO group_members (group_id, user_id, role, joined_at) VALUES
('550e8400-e29b-41d4-a716-446655440601', '1f98af3b-39d2-46d1-ac54-11d24b48e0c6', 'admin', NOW()),
('550e8400-e29b-41d4-a716-446655440601', '112d0476-76f7-4c40-bba7-b8f11661f639', 'member', NOW()),
('550e8400-e29b-41d4-a716-446655440601', '0daf4e1d-3985-4460-a7c2-9cc0ec63f038', 'member', NOW()),
('550e8400-e29b-41d4-a716-446655440602', '112d0476-76f7-4c40-bba7-b8f11661f639', 'admin', NOW()),
('550e8400-e29b-41d4-a716-446655440602', '0daf4e1d-3985-4460-a7c2-9cc0ec63f038', 'member', NOW()),
('550e8400-e29b-41d4-a716-446655440603', '29f72951-7c44-4c71-abe2-f1031db3456f', 'admin', NOW()),
('550e8400-e29b-41d4-a716-446655440603', '8e58b0ff-6a16-4fc8-b79d-837337e97b5c', 'member', NOW()),
('550e8400-e29b-41d4-a716-446655440604', '4f943ef0-0d8f-4b97-97c4-4659b1a2016b', 'admin', NOW());

-- 10. CREATE GROUP POSTS
-- =====================
INSERT INTO group_posts (id, group_id, title, content, author_id, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440701', '550e8400-e29b-41d4-a716-446655440601', 'Próxima reunión', '¿Qué día les parece mejor para la próxima reunión?', '1f98af3b-39d2-46d1-ac54-11d24b48e0c6', NOW()),
('550e8400-e29b-41d4-a716-446655440702', '550e8400-e29b-41d4-a716-446655440601', 'Actividades propuestas', 'Propongo organizar una cena de vecinos el próximo mes', '112d0476-76f7-4c40-bba7-b8f11661f639', NOW()),
('550e8400-e29b-41d4-a716-446655440703', '550e8400-e29b-41d4-a716-446655440602', 'Paseo de mascotas', '¿Quieren organizar un paseo grupal de mascotas?', '112d0476-76f7-4c40-bba7-b8f11661f639', NOW()),
('550e8400-e29b-41d4-a716-446655440704', '550e8400-e29b-41d4-a716-446655440603', 'Tips de jardinería', 'Comparto algunos tips para mantener las plantas en balcones', '29f72951-7c44-4c71-abe2-f1031db3456f', NOW()),
('550e8400-e29b-41d4-a716-446655440705', '550e8400-e29b-41d4-a716-446655440604', 'Clase de yoga', '¿Les interesa una clase de yoga en la terraza?', '4f943ef0-0d8f-4b97-97c4-4659b1a2016b', NOW());

-- 11. CREATE INVITATIONS
-- ======================
INSERT INTO invitations (id, inviter_id, building_id, email, token, status, expires_at, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440801', '1f98af3b-39d2-46d1-ac54-11d24b48e0c6', '550e8400-e29b-41d4-a716-446655440001', 'nuevo.vecino@email.com', 'token-001', 'pending', NOW() + INTERVAL '7 days', NOW()),
('550e8400-e29b-41d4-a716-446655440802', 'ab85f2c0-0726-4121-b692-a72c82b2a504', '550e8400-e29b-41d4-a716-446655440001', 'nuevo.admin@email.com', 'token-002', 'pending', NOW() + INTERVAL '7 days', NOW()),
('550e8400-e29b-41d4-a716-446655440803', 'a7ac335c-836f-4c91-b8c5-b0a80bf9cafe', '550e8400-e29b-41d4-a716-446655440002', 'nuevo.negocio@email.com', 'token-003', 'pending', NOW() + INTERVAL '7 days', NOW()),
('550e8400-e29b-41d4-a716-446655440804', '1f98af3b-39d2-46d1-ac54-11d24b48e0c6', '550e8400-e29b-41d4-a716-446655440003', 'nuevo.propietario@email.com', 'token-004', 'pending', NOW() + INTERVAL '7 days', NOW());

-- Success message
SELECT '✅ Test data created successfully!' as message;
SELECT '📊 Summary:' as summary;
SELECT '🏢 Buildings: ' || COUNT(*) as buildings FROM buildings;
SELECT '👥 Profiles: ' || COUNT(*) as profiles FROM profiles;
SELECT '👥 Business Categories: ' || COUNT(*) as business_categories FROM business_categories;
SELECT '🏪 Businesses: ' || COUNT(*) as businesses FROM businesses;
SELECT '🔧 Maintenance Requests: ' || COUNT(*) as maintenance_requests FROM maintenance_requests;
SELECT '💰 Payments: ' || COUNT(*) as payments FROM payments;
SELECT '📝 Community Posts: ' || COUNT(*) as community_posts FROM community_posts;
SELECT '👥 Groups: ' || COUNT(*) as groups FROM groups;
SELECT '📧 Invitations: ' || COUNT(*) as invitations FROM invitations;
