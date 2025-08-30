-- Simple script to populate sample data for testing
-- Run this in your Supabase SQL Editor

-- Insert sample buildings
INSERT INTO buildings (id, name, address, description, security_code, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Torre Central', 'Av. Corrientes 1234, Buenos Aires', 'Modern residential tower in the heart of Buenos Aires', 'TC2024', NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'Residencial Palermo', 'Jorge Luis Borges 567, Palermo', 'Cozy residential complex in trendy Palermo neighborhood', 'RP2024', NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample maintenance requests
INSERT INTO maintenance_requests (id, building_id, title, description, priority, status, estimated_cost, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440501', '550e8400-e29b-41d4-a716-446655440001', 'Fuga de agua en baño', 'Hay una fuga de agua en el baño del apartamento 3A', 'high', 'pending', 25000, NOW()),
('550e8400-e29b-41d4-a716-446655440502', '550e8400-e29b-41d4-a716-446655440001', 'Ascensor fuera de servicio', 'El ascensor del edificio principal no funciona', 'urgent', 'in_progress', 150000, NOW()),
('550e8400-e29b-41d4-a716-446655440503', '550e8400-e29b-41d4-a716-446655440001', 'Problema de calefacción', 'La calefacción no funciona en el apartamento 5B', 'medium', 'pending', 35000, NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample payments
INSERT INTO payments (id, building_id, apartment, amount, payment_type, due_date, status, payment_method, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440601', '550e8400-e29b-41d4-a716-446655440001', '3A', 85000, 'rent', '2024-01-25', 'paid', 'transfer', NOW()),
('550e8400-e29b-41d4-a716-446655440602', '550e8400-e29b-41d4-a716-446655440001', '5B', 92000, 'rent', '2024-01-25', 'pending', 'cash', NOW()),
('550e8400-e29b-41d4-a716-446655440603', '550e8400-e29b-41d4-a716-446655440001', '2C', 78000, 'rent', '2024-01-25', 'paid', 'transfer', NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample invitations (using correct schema)
-- Note: inviter_id is set to NULL for now since we don't have user IDs
INSERT INTO invitations (id, building_id, email, token, status, expires_at, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440801', '550e8400-e29b-41d4-a716-446655440001', 'maria.gonzalez@example.com', 'token-maria-gonzalez-123', 'pending', '2024-02-20', NOW()),
('550e8400-e29b-41d4-a716-446655440802', '550e8400-e29b-41d4-a716-446655440001', 'carlos.rodriguez@example.com', 'token-carlos-rodriguez-456', 'accepted', '2024-02-15', NOW())
ON CONFLICT (id) DO NOTHING;

-- Show summary
SELECT 'Sample data populated successfully!' as status;
SELECT COUNT(*) as total_buildings FROM buildings;
SELECT COUNT(*) as total_maintenance_requests FROM maintenance_requests;
SELECT COUNT(*) as total_payments FROM payments;
SELECT COUNT(*) as total_invitations FROM invitations;
