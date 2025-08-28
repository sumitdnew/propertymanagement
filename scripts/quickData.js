import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

// Quick sample data for testing
const buildings = [
  {
    name: 'Edificio Central',
    address: 'Av. Corrientes 1234, Buenos Aires',
    description: 'Edificio residencial de lujo en el centro de Buenos Aires',
    totalApartments: 12
  },
  {
    name: 'Torre Palermo',
    address: 'Av. Santa Fe 5678, Palermo',
    description: 'Torre moderna con amenities exclusivos en Palermo',
    totalApartments: 16
  }
];

const tenants = [
  { name: 'María González', email: 'maria@example.com', apartment: '3A' },
  { name: 'Carlos Rodríguez', email: 'carlos@example.com', apartment: '1B' },
  { name: 'Ana Martínez', email: 'ana@example.com', apartment: '2C' },
  { name: 'Luis Fernández', email: 'luis@example.com', apartment: '4D' }
];

const maintenanceRequests = [
  { title: 'Fuga de agua en baño', description: 'Hay una fuga de agua en el baño del departamento', status: 'pending', priority: 'high' },
  { title: 'Ascensor fuera de servicio', description: 'El ascensor del edificio principal no funciona', status: 'in-progress', priority: 'critical' },
  { title: 'Problema con calefacción', description: 'La calefacción no está funcionando correctamente', status: 'completed', priority: 'medium' }
];

const communityPosts = [
  { content: '¿Alguien sabe si hay algún evento en el barrio este fin de semana?', type: 'question' },
  { content: 'Excelente trabajo del personal de limpieza hoy. ¡El edificio se ve impecable!', type: 'appreciation' },
  { content: 'Recordatorio: mañana hay reunión de consorcio a las 19:00hs', type: 'announcement' }
];

async function generateQuickData() {
  const db = new sqlite3.Database('./server/database.sqlite');
  
  console.log('Generating quick sample data...');
  
  try {
    // Clear existing data
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM invitations', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM payments', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM community_posts', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM maintenance_requests', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
         await new Promise((resolve, reject) => {
       db.run('DELETE FROM users', (err) => {
         if (err) reject(err);
         else resolve();
       });
     });
    
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM buildings', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    console.log('Existing data cleared');
    
    // Create buildings
    const buildingIds = [];
    for (const building of buildings) {
      const buildingId = uuidv4();
      buildingIds.push(buildingId);
      
      await new Promise((resolve, reject) => {
        db.run(`INSERT INTO buildings (id, name, address, description, totalApartments) 
                VALUES (?, ?, ?, ?, ?)`, 
          [buildingId, building.name, building.address, building.description, building.totalApartments],
          (err) => {
            if (err) reject(err);
            else resolve();
          });
      });
    }
    
    console.log(`${buildings.length} buildings created`);
    
    // Create admin users
    const adminIds = [];
    for (let i = 0; i < buildings.length; i++) {
      const adminId = uuidv4();
      adminIds.push(adminId);
      const adminHash = await bcrypt.hash('admin123', 10);
      
      await new Promise((resolve, reject) => {
        db.run(`INSERT INTO users (id, name, email, password, phone, userType, apartment, buildingId) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
          [adminId, `Admin ${buildings[i].name}`, `admin${i + 1}@example.com`, adminHash, '+54 11 1234-5678', 'property-manager', 'Admin', buildingIds[i]],
          (err) => {
            if (err) reject(err);
            else resolve();
          });
      });
    }
    
    // Create tenant users
    const tenantIds = [];
    for (let i = 0; i < tenants.length; i++) {
      const tenantId = uuidv4();
      tenantIds.push(tenantId);
      const tenantHash = await bcrypt.hash('tenant123', 10);
      const buildingId = buildingIds[i % buildingIds.length];
      
      await new Promise((resolve, reject) => {
        db.run(`INSERT INTO users (id, name, email, password, phone, userType, apartment, buildingId) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
          [tenantId, tenants[i].name, tenants[i].email, tenantHash, '+54 11 2345-6789', 'tenant', tenants[i].apartment, buildingId],
          (err) => {
            if (err) reject(err);
            else resolve();
          });
      });
    }
    
    console.log(`${tenants.length} tenants created`);
    
    // Create maintenance requests
    for (let i = 0; i < maintenanceRequests.length; i++) {
      const requestId = uuidv4();
      const buildingId = buildingIds[i % buildingIds.length];
      const tenantId = tenantIds[i % tenantIds.length];
      const tenant = tenants[i % tenants.length];
      
      await new Promise((resolve, reject) => {
        db.run(`INSERT INTO maintenance_requests (id, title, description, status, priority, submittedBy, apartment, buildingId, estimatedCost) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
          [requestId, maintenanceRequests[i].title, maintenanceRequests[i].description, maintenanceRequests[i].status, maintenanceRequests[i].priority, tenantId, tenant.apartment, buildingId, Math.floor(Math.random() * 50000) + 10000],
          (err) => {
            if (err) reject(err);
            else resolve();
          });
      });
    }
    
    console.log(`${maintenanceRequests.length} maintenance requests created`);
    
    // Create community posts
    for (let i = 0; i < communityPosts.length; i++) {
      const postId = uuidv4();
      const buildingId = buildingIds[i % buildingIds.length];
      const tenantId = tenantIds[i % tenantIds.length];
      const tenant = tenants[i % tenants.length];
      
      await new Promise((resolve, reject) => {
        db.run(`INSERT INTO community_posts (id, author, apartment, content, type, buildingId) 
                VALUES (?, ?, ?, ?, ?, ?)`, 
          [postId, tenantId, tenant.apartment, communityPosts[i].content, communityPosts[i].type, buildingId],
          (err) => {
            if (err) reject(err);
            else resolve();
          });
      });
    }
    
    console.log(`${communityPosts.length} community posts created`);
    
    // Create some payments
    for (let i = 0; i < 8; i++) {
      const paymentId = uuidv4();
      const buildingId = buildingIds[i % buildingIds.length];
      const tenantId = tenantIds[i % tenantIds.length];
      const tenant = tenants[i % tenants.length];
      
      await new Promise((resolve, reject) => {
        db.run(`INSERT INTO payments (id, tenantId, apartment, amount, type, date, status, method, buildingId) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
          [paymentId, tenantId, tenant.apartment, Math.floor(Math.random() * 100000) + 50000, 'rent', '2024-01-25', Math.random() > 0.3 ? 'paid' : 'pending', 'transfer', buildingId],
          (err) => {
            if (err) reject(err);
            else resolve();
          });
      });
    }
    
    console.log('8 payments created');
    
    console.log('\n✅ Quick sample data generation completed!');
    console.log('\n🔑 Login credentials:');
    console.log('Admin: admin1@example.com / admin123');
    console.log('Tenant: maria@example.com / tenant123');
    
  } catch (error) {
    console.error('Error generating quick data:', error);
  } finally {
    db.close();
  }
}

// Run the script
generateQuickData();
