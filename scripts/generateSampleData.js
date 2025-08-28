import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

// Sample data arrays
const buildingNames = [
  'Edificio Central',
  'Torre Palermo',
  'Residencial Recoleta',
  'Edificio Belgrano',
  'Torre San Telmo',
  'Residencial Puerto Madero',
  'Edificio Villa Crespo',
  'Torre Caballito',
  'Residencial Almagro',
  'Edificio Boedo'
];

const buildingAddresses = [
  'Av. Corrientes 1234, Buenos Aires',
  'Av. Santa Fe 5678, Palermo',
  'Av. Callao 9012, Recoleta',
  'Av. Cabildo 3456, Belgrano',
  'Defensa 7890, San Telmo',
  'Av. Alicia Moreau de Justo 1234, Puerto Madero',
  'Av. Corrientes 5678, Villa Crespo',
  'Av. Rivadavia 9012, Caballito',
  'Av. Corrientes 3456, Almagro',
  'Av. Boedo 7890, Boedo'
];

const buildingDescriptions = [
  'Edificio residencial de lujo en el centro de Buenos Aires',
  'Torre moderna con amenities exclusivos en Palermo',
  'Residencial histórico en el corazón de Recoleta',
  'Edificio familiar en zona residencial de Belgrano',
  'Torre boutique en el barrio histórico de San Telmo',
  'Residencial premium con vista al río en Puerto Madero',
  'Edificio moderno en zona de moda de Villa Crespo',
  'Torre residencial en el centro geográfico de la ciudad',
  'Residencial con jardines en Almagro',
  'Edificio tradicional en el barrio de Boedo'
];

const tenantNames = [
  'María González',
  'Carlos Rodríguez',
  'Ana Martínez',
  'Luis Fernández',
  'Carmen López',
  'Roberto Silva',
  'Isabel Torres',
  'Miguel Herrera',
  'Patricia Vargas',
  'Fernando Morales',
  'Lucía Jiménez',
  'Diego Castro',
  'Valentina Ruiz',
  'Santiago Moreno',
  'Camila Ortega',
  'Andrés Paredes',
  'Sofía Mendoza',
  'Gabriel Rojas',
  'Daniela Vega',
  'Ricardo Soto'
];

const tenantEmails = [
  'maria.gonzalez@email.com',
  'carlos.rodriguez@email.com',
  'ana.martinez@email.com',
  'luis.fernandez@email.com',
  'carmen.lopez@email.com',
  'roberto.silva@email.com',
  'isabel.torres@email.com',
  'miguel.herrera@email.com',
  'patricia.vargas@email.com',
  'fernando.morales@email.com',
  'lucia.jimenez@email.com',
  'diego.castro@email.com',
  'valentina.ruiz@email.com',
  'santiago.moreno@email.com',
  'camila.ortega@email.com',
  'andres.paredes@email.com',
  'sofia.mendoza@email.com',
  'gabriel.rojas@email.com',
  'daniela.vega@email.com',
  'ricardo.soto@email.com'
];

const phoneNumbers = [
  '+54 11 1234-5678',
  '+54 11 2345-6789',
  '+54 11 3456-7890',
  '+54 11 4567-8901',
  '+54 11 5678-9012',
  '+54 11 6789-0123',
  '+54 11 7890-1234',
  '+54 11 8901-2345',
  '+54 11 9012-3456',
  '+54 11 0123-4567',
  '+54 11 1111-2222',
  '+54 11 2222-3333',
  '+54 11 3333-4444',
  '+54 11 4444-5555',
  '+54 11 5555-6666',
  '+54 11 6666-7777',
  '+54 11 7777-8888',
  '+54 11 8888-9999',
  '+54 11 9999-0000',
  '+54 11 0000-1111'
];

const apartmentNumbers = [
  '1A', '1B', '1C', '1D',
  '2A', '2B', '2C', '2D',
  '3A', '3B', '3C', '3D',
  '4A', '4B', '4C', '4D',
  '5A', '5B', '5C', '5D',
  '6A', '6B', '6C', '6D',
  '7A', '7B', '7C', '7D',
  '8A', '8B', '8C', '8D',
  '9A', '9B', '9C', '9D',
  '10A', '10B', '10C', '10D'
];

const maintenanceTitles = [
  'Fuga de agua en baño',
  'Ascensor fuera de servicio',
  'Problema con calefacción',
  'Luz del pasillo no funciona',
  'Cerradura de entrada rota',
  'Problema con aire acondicionado',
  'Filtración en techo',
  'Puerta de garaje no abre',
  'Problema con sistema de agua',
  'Alarma de incendio defectuosa',
  'Ventana rota',
  'Problema con electricidad',
  'Desagüe tapado',
  'Pintura descascarada',
  'Problema con timbre'
];

const maintenanceDescriptions = [
  'Hay una fuga de agua en el baño del departamento que está causando humedad',
  'El ascensor del edificio principal no funciona desde esta mañana',
  'La calefacción no está funcionando correctamente en el departamento',
  'La luz del pasillo del 3er piso no funciona desde hace días',
  'La cerradura de la entrada principal está rota y no cierra bien',
  'El aire acondicionado no enfría correctamente',
  'Hay una filtración en el techo del departamento que está causando goteras',
  'La puerta del garaje no abre con el control remoto',
  'El sistema de agua tiene baja presión en todo el edificio',
  'La alarma de incendio está sonando sin motivo aparente',
  'Una ventana se rompió durante la tormenta de anoche',
  'Hay un problema con la electricidad en el departamento',
  'El desagüe de la cocina está tapado',
  'La pintura de la pared exterior se está descascarando',
  'El timbre del departamento no funciona'
];

const communityPostTypes = [
  'question',
  'announcement',
  'appreciation',
  'complaint',
  'general'
];

const communityPostContent = [
  '¿Alguien sabe si hay algún evento en el barrio este fin de semana?',
  'Excelente trabajo del personal de limpieza hoy. ¡El edificio se ve impecable!',
  'Recordatorio: mañana hay reunión de consorcio a las 19:00hs',
  '¿Alguien perdió un gato naranja? Lo vi en el jardín',
  'Felicitaciones a todos por mantener el edificio tan limpio',
  '¿Hay algún vecino que tenga herramientas que pueda prestar?',
  'Aviso importante: mañana habrá corte de agua de 9 a 12hs',
  'Gracias a todos por la colaboración en el mantenimiento',
  '¿Alguien conoce un buen electricista de confianza?',
  'Recordatorio: por favor no dejar basura en los pasillos',
  '¡Qué lindo día! El jardín se ve espectacular',
  '¿Alguien sabe si hay algún problema con el WiFi del edificio?',
  'Aviso: el ascensor estará en mantenimiento el viernes',
  'Gracias a los vecinos que ayudaron con la limpieza',
  '¿Alguien tiene recomendaciones para un buen plomero?'
];

const paymentTypes = ['rent', 'deposit', 'expense', 'other'];
const paymentMethods = ['transfer', 'cash', 'check', 'card'];
const paymentStatuses = ['paid', 'pending', 'overdue'];

// Helper function to get random item from array
function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Helper function to get random items from array
function getRandomItems(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Helper function to generate random date within range
function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Helper function to format date for SQLite
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

async function generateSampleData() {
  const db = new sqlite3.Database('./server/database.sqlite');
  
  console.log('Starting sample data generation...');
  
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
      db.run('DELETE FROM users WHERE userType = "tenant"', (err) => {
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
    
    // Generate buildings
    const buildings = [];
    for (let i = 0; i < buildingNames.length; i++) {
      const buildingId = uuidv4();
      const building = {
        id: buildingId,
        name: buildingNames[i],
        address: buildingAddresses[i],
        description: buildingDescriptions[i],
        totalApartments: Math.floor(Math.random() * 20) + 8 // 8-28 apartments
      };
      buildings.push(building);
      
      await new Promise((resolve, reject) => {
        db.run(`INSERT INTO buildings (id, name, address, description, totalApartments) 
                VALUES (?, ?, ?, ?, ?)`, 
          [building.id, building.name, building.address, building.description, building.totalApartments],
          (err) => {
            if (err) reject(err);
            else resolve();
          });
      });
    }
    
    console.log(`${buildings.length} buildings created`);
    
    // Generate users (admin + tenants)
    const users = [];
    
    // Create admin users for each building
    for (let i = 0; i < buildings.length; i++) {
      const adminId = uuidv4();
      const adminHash = await bcrypt.hash('admin123', 10);
      const admin = {
        id: adminId,
        name: `Admin ${buildings[i].name}`,
        email: `admin${i + 1}@example.com`,
        password: adminHash,
        phone: phoneNumbers[i],
        userType: 'property-manager',
        apartment: 'Admin',
        buildingId: buildings[i].id
      };
      users.push(admin);
      
      await new Promise((resolve, reject) => {
        db.run(`INSERT INTO users (id, name, email, password, phone, userType, apartment, buildingId) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
          [admin.id, admin.name, admin.email, admin.password, admin.phone, admin.userType, admin.apartment, admin.buildingId],
          (err) => {
            if (err) reject(err);
            else resolve();
          });
      });
    }
    
    // Create tenant users
    const tenantsPerBuilding = Math.floor(tenantNames.length / buildings.length);
    for (let i = 0; i < buildings.length; i++) {
      const building = buildings[i];
      const startIndex = i * tenantsPerBuilding;
      const endIndex = Math.min(startIndex + tenantsPerBuilding, tenantNames.length);
      
      for (let j = startIndex; j < endIndex; j++) {
        const tenantId = uuidv4();
        const tenantHash = await bcrypt.hash('tenant123', 10);
        const tenant = {
          id: tenantId,
          name: tenantNames[j],
          email: tenantEmails[j],
          password: tenantHash,
          phone: phoneNumbers[j],
          userType: 'tenant',
          apartment: apartmentNumbers[j % apartmentNumbers.length],
          buildingId: building.id
        };
        users.push(tenant);
        
        await new Promise((resolve, reject) => {
          db.run(`INSERT INTO users (id, name, email, password, phone, userType, apartment, buildingId) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
            [tenant.id, tenant.name, tenant.email, tenant.password, tenant.phone, tenant.userType, tenant.apartment, tenant.buildingId],
            (err) => {
              if (err) reject(err);
              else resolve();
            });
        });
      }
    }
    
    console.log(`${users.length} users created`);
    
    // Generate maintenance requests
    const maintenanceRequests = [];
    const statuses = ['pending', 'in-progress', 'completed'];
    const priorities = ['low', 'medium', 'high', 'critical'];
    
    for (let i = 0; i < 50; i++) {
      const requestId = uuidv4();
      const building = getRandomItem(buildings);
      const tenant = users.find(u => u.buildingId === building.id && u.userType === 'tenant');
      const request = {
        id: requestId,
        title: getRandomItem(maintenanceTitles),
        description: getRandomItem(maintenanceDescriptions),
        status: getRandomItem(statuses),
        priority: getRandomItem(priorities),
        submittedBy: tenant.id,
        apartment: tenant.apartment,
        buildingId: building.id,
        estimatedCost: Math.floor(Math.random() * 100000) + 5000,
        timeSpent: Math.floor(Math.random() * 40) + 1,
        submittedDate: getRandomDate(new Date(2024, 0, 1), new Date())
      };
      maintenanceRequests.push(request);
      
      await new Promise((resolve, reject) => {
        db.run(`INSERT INTO maintenance_requests (id, title, description, status, priority, submittedBy, apartment, buildingId, estimatedCost, timeSpent, submittedDate) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
          [request.id, request.title, request.description, request.status, request.priority, request.submittedBy, request.apartment, request.buildingId, request.estimatedCost, request.timeSpent, request.submittedDate],
          (err) => {
            if (err) reject(err);
            else resolve();
          });
      });
    }
    
    console.log(`${maintenanceRequests.length} maintenance requests created`);
    
    // Generate community posts
    const communityPosts = [];
    
    for (let i = 0; i < 80; i++) {
      const postId = uuidv4();
      const building = getRandomItem(buildings);
      const tenant = users.find(u => u.buildingId === building.id && u.userType === 'tenant');
      const post = {
        id: postId,
        author: tenant.id,
        apartment: tenant.apartment,
        content: getRandomItem(communityPostContent),
        type: getRandomItem(communityPostTypes),
        likes: Math.floor(Math.random() * 20),
        comments: Math.floor(Math.random() * 10),
        buildingId: building.id,
        timestamp: getRandomDate(new Date(2024, 0, 1), new Date())
      };
      communityPosts.push(post);
      
      await new Promise((resolve, reject) => {
        db.run(`INSERT INTO community_posts (id, author, apartment, content, type, likes, comments, buildingId, timestamp) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
          [post.id, post.author, post.apartment, post.content, post.type, post.likes, post.comments, post.buildingId, post.timestamp],
          (err) => {
            if (err) reject(err);
            else resolve();
          });
      });
    }
    
    console.log(`${communityPosts.length} community posts created`);
    
    // Generate payments
    const payments = [];
    
    for (let i = 0; i < 120; i++) {
      const paymentId = uuidv4();
      const building = getRandomItem(buildings);
      const tenant = users.find(u => u.buildingId === building.id && u.userType === 'tenant');
      const payment = {
        id: paymentId,
        tenantId: tenant.id,
        apartment: tenant.apartment,
        amount: Math.floor(Math.random() * 150000) + 50000, // 50k to 200k pesos
        type: getRandomItem(paymentTypes),
        date: formatDate(getRandomDate(new Date(2024, 0, 1), new Date())),
        status: getRandomItem(paymentStatuses),
        method: getRandomItem(paymentMethods),
        notes: Math.random() > 0.7 ? 'Pago con descuento por pronto pago' : null,
        buildingId: building.id
      };
      payments.push(payment);
      
      await new Promise((resolve, reject) => {
        db.run(`INSERT INTO payments (id, tenantId, apartment, amount, type, date, status, method, notes, buildingId) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
          [payment.id, payment.tenantId, payment.apartment, payment.amount, payment.type, payment.date, payment.status, payment.method, payment.notes, payment.buildingId],
          (err) => {
            if (err) reject(err);
            else resolve();
          });
      });
    }
    
    console.log(`${payments.length} payments created`);
    
    // Generate invitations
    const invitations = [];
    
    for (let i = 0; i < 30; i++) {
      const invitationId = uuidv4();
      const building = getRandomItem(buildings);
      const admin = users.find(u => u.buildingId === building.id && u.userType === 'property-manager');
      const invitation = {
        id: invitationId,
        email: `invite${i + 1}@example.com`,
        apartment: apartmentNumbers[i % apartmentNumbers.length],
        name: `Invitado ${i + 1}`,
        phone: phoneNumbers[i % phoneNumbers.length],
        rentAmount: Math.floor(Math.random() * 150000) + 50000,
        status: getRandomItem(['pending', 'accepted', 'expired']),
        invitedBy: admin.id,
        buildingId: building.id,
        invitationToken: uuidv4(),
        invitedDate: getRandomDate(new Date(2024, 0, 1), new Date()),
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
      };
      invitations.push(invitation);
      
      await new Promise((resolve, reject) => {
        db.run(`INSERT INTO invitations (id, email, apartment, name, phone, rentAmount, status, invitedBy, buildingId, invitationToken, invitedDate, expiresAt) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
          [invitation.id, invitation.email, invitation.apartment, invitation.name, invitation.phone, invitation.rentAmount, invitation.status, invitation.invitedBy, invitation.buildingId, invitation.invitationToken, invitation.invitedDate, invitation.expiresAt],
          (err) => {
            if (err) reject(err);
            else resolve();
          });
      });
    }
    
    console.log(`${invitations.length} invitations created`);
    
    console.log('\n✅ Sample data generation completed successfully!');
    console.log('\n📊 Generated data summary:');
    console.log(`- ${buildings.length} buildings`);
    console.log(`- ${users.length} users (${buildings.length} admins + ${users.length - buildings.length} tenants)`);
    console.log(`- ${maintenanceRequests.length} maintenance requests`);
    console.log(`- ${communityPosts.length} community posts`);
    console.log(`- ${payments.length} payments`);
    console.log(`- ${invitations.length} invitations`);
    
    console.log('\n🔑 Sample login credentials:');
    console.log('Admin users: admin1@example.com / admin123');
    console.log('Tenant users: maria.gonzalez@email.com / tenant123');
    
  } catch (error) {
    console.error('Error generating sample data:', error);
  } finally {
    db.close();
  }
}

// Run the script
generateSampleData();
