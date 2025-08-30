-- Sample Data for BA Property Manager
-- This script populates the database with realistic sample data
-- Updated to match the actual database schema and use proper UUIDs

-- IMPORTANT: This script provides TWO approaches for sample users:
-- Approach 1: Create users through Supabase Auth API (recommended)
-- Approach 2: Use the script below with manual user creation

-- ========================================
-- APPROACH 1: Create users via Supabase Auth API (RECOMMENDED)
-- ========================================
-- Run these commands in your application or use the Supabase Dashboard

/*
-- Example of creating users programmatically (you can run this in your React app):
const createSampleUsers = async () => {
  const users = [
    { email: 'admin@example.com', password: 'password123', name: 'María González' },
    { email: 'carlos.rodriguez@example.com', password: 'password123', name: 'Carlos Rodríguez' },
    { email: 'ana.martinez@example.com', password: 'password123', name: 'Ana Martínez' },
    { email: 'juan.perez@example.com', password: 'password123', name: 'Juan Pérez' },
    { email: 'laura.fernandez@example.com', password: 'password123', name: 'Laura Fernández' },
    { email: 'roberto.silva@example.com', password: 'password123', name: 'Roberto Silva' },
    { email: 'patricia.lopez@example.com', password: 'password123', name: 'Patricia López' },
    { email: 'miguel.torres@example.com', password: 'password123', name: 'Miguel Torres' },
    { email: 'carmen.ruiz@example.com', password: 'password123', name: 'Carmen Ruiz' }
  ];

  for (const user of users) {
    const { data, error } = await supabase.auth.signUp({
      email: user.email,
      password: user.password,
      options: {
        data: { name: user.name }
      }
    });
    if (error) console.error('Error creating user:', error);
    else console.log('User created:', user.email);
  }
};
*/

-- ========================================
-- APPROACH 2: Manual user creation via Supabase Dashboard
-- ========================================
        -- 1. Go to your Supabase Dashboard > Authentication > Users
        -- 2. Click "Add User" and create these users manually:
        --    - admin@ba-property.com (password: TestPass123!)
        --    - carlos.rodriguez@ba-property.com (password: TestPass123!)
        --    - ana.martinez@ba-property.com (password: TestPass123!)
        --    - juan.perez@ba-property.com (password: TestPass123!)
        --    - laura.fernandez@ba-property.com (password: TestPass123!)
        --    - roberto.silva@ba-property.com (password: TestPass123!)
        --    - patricia.lopez@ba-property.com (password: TestPass123!)
        --    - miguel.torres@ba-property.com (password: TestPass123!)
        --    - carmen.ruiz@ba-property.com (password: TestPass123!)

-- ========================================
-- SAMPLE DATA INSERTION (Run this AFTER creating users)
-- ========================================

-- Insert sample buildings
INSERT INTO buildings (id, name, address, description, security_code, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Torre Central', 'Av. Corrientes 1234, Buenos Aires', 'Modern residential tower in the heart of Buenos Aires', 'TC2024', NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'Residencial Palermo', 'Jorge Luis Borges 567, Palermo', 'Cozy residential complex in trendy Palermo neighborhood', 'RP2024', NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'Edificio Microcentro', 'Florida 890, Microcentro', 'Historic building in the financial district', 'EM2024', NOW());

-- Insert sample business categories
INSERT INTO business_categories (id, name, description, icon, color, sort_order) VALUES
('550e8400-e29b-41d4-a716-446655440101', 'Plomería', 'Servicios de plomería y fontanería', 'wrench', '#3B82F6', 1),
('550e8400-e29b-41d4-a716-446655440102', 'Electricidad', 'Servicios eléctricos residenciales', 'zap', '#10B981', 2),
('550e8400-e29b-41d4-a716-446655440103', 'Ascensores', 'Mantenimiento y reparación de ascensores', 'arrow-up', '#F59E0B', 3),
('550e8400-e29b-41d4-a716-446655440104', 'Limpieza', 'Servicios de limpieza para edificios', 'sparkles', '#8B5CF6', 4);

-- ========================================
-- IMPORTANT: After creating users, run this section to get their IDs
-- ========================================
-- This will show you the actual user IDs that were created in auth.users
-- Copy these IDs and use them in the profile insertions below

/*
        -- Run this query to see the user IDs:
        SELECT id, email, raw_user_meta_data->>'name' as name
        FROM auth.users
        WHERE email IN (
          'admin@ba-property.com',
          'carlos.rodriguez@ba-property.com',
          'ana.martinez@ba-property.com',
          'juan.perez@ba-property.com',
          'laura.fernandez@ba-property.com',
          'roberto.silva@ba-property.com',
          'patricia.lopez@ba-property.com',
          'miguel.torres@ba-property.com',
          'carmen.ruiz@ba-property.com'
        );
*/

-- ========================================
-- SAMPLE PROFILES (Check if they already exist first)
-- ========================================
-- Check if profiles already exist to avoid duplicate key errors
DO $$
BEGIN
    -- Only insert profiles if they don't already exist
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = '1f98af3b-39d2-46d1-ac54-11d24b48e0c6') THEN
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
        
        RAISE NOTICE 'Profiles inserted successfully';
    ELSE
        RAISE NOTICE 'Profiles already exist, skipping profile insertion';
    END IF;
END $$;

-- ========================================
-- SAMPLE BUSINESSES (Update owner_id after creating profiles)
-- ========================================
-- Insert sample businesses (without owner_id for now)
INSERT INTO businesses (id, name, category_id, description, address, phone, email, website, status, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440301', 'Plomería Rápida', '550e8400-e29b-41d4-a716-446655440101', 'Servicios de plomería 24/7 para emergencias', 'Av. Corrientes 1500, Buenos Aires', '+54 11 1111-1111', 'info@plomeria.com', 'www.plomeria.com', 'approved', NOW()),
('550e8400-e29b-41d4-a716-446655440302', 'Ascensores BA', '550e8400-e29b-41d4-a716-446655440103', 'Mantenimiento y reparación de ascensores', 'Florida 1000, Buenos Aires', '+54 11 2222-2222', 'servicio@ascensoresba.com', 'www.ascensoresba.com', 'approved', NOW()),
('550e8400-e29b-41d4-a716-446655440303', 'Electricidad Express', '550e8400-e29b-41d4-a716-446655440102', 'Servicios eléctricos residenciales', 'Jorge Luis Borges 800, Palermo', '+54 11 3333-3333', 'contacto@electricidad.com', 'www.electricidad.com', 'approved', NOW()),
('550e8400-e29b-41d4-a716-446655440304', 'Limpieza Profesional', '550e8400-e29b-41d4-a716-446655440104', 'Servicios de limpieza para edificios', 'Microcentro 500, Buenos Aires', '+54 11 4444-4444', 'info@limpieza.com', 'www.limpieza.com', 'approved', NOW());

-- ========================================
-- SAMPLE MAINTENANCE REQUESTS (Update requester_id after creating profiles)
-- ========================================
INSERT INTO maintenance_requests (id, building_id, title, description, priority, status, estimated_cost, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440501', '550e8400-e29b-41d4-a716-446655440001', 'Fuga de agua en baño', 'Hay una fuga de agua en el baño del apartamento 3A', 'high', 'pending', 25000, NOW()),
('550e8400-e29b-41d4-a716-446655440502', '550e8400-e29b-41d4-a716-446655440001', 'Ascensor fuera de servicio', 'El ascensor del edificio principal no funciona', 'urgent', 'in_progress', 150000, NOW()),
('550e8400-e29b-41d4-a716-446655440503', '550e8400-e29b-41d4-a716-446655440001', 'Problema de calefacción', 'La calefacción no funciona en el apartamento 5B', 'medium', 'pending', 35000, NOW()),
('550e8400-e29b-41d4-a716-446655440504', '550e8400-e29b-41d4-a716-446655440001', 'Luz del pasillo defectuosa', 'La luz del pasillo del 2do piso no funciona', 'low', 'completed', 8000, NOW()),
('550e8400-e29b-41d4-a716-446655440505', '550e8400-e29b-41d4-a716-446655440002', 'Cerradura rota', 'La cerradura de la puerta principal del apartamento 1A no funciona', 'medium', 'pending', 12000, NOW()),
('550e8400-e29b-41d4-a716-446655440506', '550e8400-e29b-41d4-a716-446655440002', 'Problema de electricidad', 'Cortocircuito en el apartamento 4B', 'high', 'in_progress', 45000, NOW());

-- ========================================
-- SAMPLE PAYMENTS (Update tenant_id after creating profiles)
-- ========================================
INSERT INTO payments (id, building_id, apartment, amount, payment_type, due_date, status, payment_method, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440601', '550e8400-e29b-41d4-a716-446655440001', '3A', 85000, 'rent', '2024-01-25', 'paid', 'transfer', NOW()),
('550e8400-e29b-41d4-a716-446655440602', '550e8400-e29b-41d4-a716-446655440001', '5B', 92000, 'rent', '2024-01-25', 'pending', 'cash', NOW()),
('550e8400-e29b-41d4-a716-446655440603', '550e8400-e29b-41d4-a716-446655440001', '2C', 78000, 'rent', '2024-01-25', 'paid', 'transfer', NOW()),
('550e8400-e29b-41d4-a716-446655440604', '550e8400-e29b-41d4-a716-446655440002', '1A', 95000, 'rent', '2024-01-25', 'paid', 'transfer', NOW()),
('550e8400-e29b-41d4-a716-446655440605', '550e8400-e29b-41d4-a716-446655440002', '4B', 88000, 'rent', '2024-01-25', 'pending', 'cash', NOW()),
('550e8400-e29b-41d4-a716-446655440606', '550e8400-e29b-41d4-a716-446655440003', '6A', 110000, 'rent', '2024-01-25', 'paid', 'transfer', NOW());

-- ========================================
-- SAMPLE COMMUNITY POSTS (Update author_id after creating profiles)
-- ========================================
INSERT INTO community_posts (id, building_id, title, content, post_type, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440701', '550e8400-e29b-41d4-a716-446655440001', 'Eventos del barrio', '¿Alguien sabe si hay algún evento en el barrio este fin de semana?', 'question', NOW()),
('550e8400-e29b-41d4-a716-446655440702', '550e8400-e29b-41d4-a716-446655440001', 'Agradecimiento al personal', 'Excelente trabajo del personal de limpieza hoy. ¡El edificio se ve impecable!', 'general', NOW()),
('550e8400-e29b-41d4-a716-446655440703', '550e8400-e29b-41d4-a716-446655440002', 'Reunión de propietarios', 'Recordatorio: Reunión de propietarios este sábado a las 10:00 AM', 'event', NOW()),
('550e8400-e29b-41d4-a716-446655440704', '550e8400-e29b-41d4-a716-446655440002', 'Recomendaciones de electricista', '¿Alguien tiene recomendaciones para un buen electricista?', 'question', NOW()),
('550e8400-e29b-41d4-a716-446655440705', '550e8400-e29b-41d4-a716-446655440003', 'Mantenimiento del edificio', 'Felicitaciones a todos por mantener el edificio tan limpio y ordenado', 'general', NOW());

-- ========================================
-- SAMPLE GROUPS (Update created_by after creating profiles)
-- ========================================
INSERT INTO groups (id, name, description, building_id, is_private, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440901', 'Vecinos Torre Central', 'Grupo para los residentes de Torre Central', '550e8400-e29b-41d4-a716-446655440001', false, NOW()),
('550e8400-e29b-41d4-a716-446655440902', 'Palermo Social', 'Grupo social para residentes de Palermo', '550e8400-e29b-41d4-a716-446655440002', false, NOW()),
('550e8400-e29b-41d4-a716-446655440903', 'Microcentro Business', 'Grupo para propietarios de Microcentro', '550e8400-e29b-41d4-a716-446655440003', true, NOW());

COMMIT;

-- Display summary of inserted data
SELECT 'Sample data insertion completed successfully!' as status;
SELECT COUNT(*) as total_buildings FROM buildings;
SELECT COUNT(*) as total_business_categories FROM business_categories;
SELECT COUNT(*) as total_businesses FROM businesses;
SELECT COUNT(*) as total_maintenance_requests FROM maintenance_requests;
SELECT COUNT(*) as total_payments FROM payments;
SELECT COUNT(*) as total_community_posts FROM community_posts;
SELECT COUNT(*) as total_groups FROM groups;

-- ========================================
-- NEXT STEPS TO COMPLETE THE SETUP:
-- ========================================
-- 1. Run this script first to create buildings, categories, etc.
-- 2. Create users through Supabase Auth (Dashboard or API)
-- 3. Get the user IDs and update the profile insertions above
-- 4. Run the profile insertions with real user IDs
-- 5. Update foreign key references in other tables
