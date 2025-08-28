import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const db = new sqlite3.Database('./server/database.sqlite', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      phone TEXT,
      userType TEXT NOT NULL,
      apartment TEXT,
      buildingId TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Buildings table
    db.run(`CREATE TABLE IF NOT EXISTS buildings (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      description TEXT,
      totalApartments INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Maintenance requests table
    db.run(`CREATE TABLE IF NOT EXISTS maintenance_requests (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'pending',
      priority TEXT DEFAULT 'medium',
      submittedBy TEXT NOT NULL,
      apartment TEXT NOT NULL,
      buildingId TEXT NOT NULL,
      assignedTo TEXT,
      estimatedCost REAL DEFAULT 0,
      timeSpent REAL DEFAULT 0,
      submittedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
      completedDate DATETIME,
      FOREIGN KEY (submittedBy) REFERENCES users (id),
      FOREIGN KEY (buildingId) REFERENCES buildings (id)
    )`);

    // Community posts table
    db.run(`CREATE TABLE IF NOT EXISTS community_posts (
      id TEXT PRIMARY KEY,
      author TEXT NOT NULL,
      apartment TEXT NOT NULL,
      content TEXT NOT NULL,
      type TEXT DEFAULT 'general',
      likes INTEGER DEFAULT 0,
      comments INTEGER DEFAULT 0,
      buildingId TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author) REFERENCES users (id),
      FOREIGN KEY (buildingId) REFERENCES buildings (id)
    )`);

    // Payments table
    db.run(`CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      tenantId TEXT NOT NULL,
      apartment TEXT NOT NULL,
      amount REAL NOT NULL,
      type TEXT DEFAULT 'rent',
      date DATE NOT NULL,
      status TEXT DEFAULT 'pending',
      method TEXT DEFAULT 'transfer',
      notes TEXT,
      buildingId TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tenantId) REFERENCES users (id),
      FOREIGN KEY (buildingId) REFERENCES buildings (id)
    )`);

    // Invitations table
    db.run(`CREATE TABLE IF NOT EXISTS invitations (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      apartment TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      rentAmount REAL DEFAULT 0,
      status TEXT DEFAULT 'pending',
      invitedBy TEXT NOT NULL,
      buildingId TEXT NOT NULL,
      invitationToken TEXT UNIQUE NOT NULL,
      invitedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
      expiresAt DATETIME NOT NULL,
      FOREIGN KEY (invitedBy) REFERENCES users (id),
      FOREIGN KEY (buildingId) REFERENCES buildings (id)
    )`);

    // Create groups table
    db.run(`
      CREATE TABLE IF NOT EXISTS groups (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        type TEXT NOT NULL CHECK(type IN ('building', 'public', 'private')),
        buildingId TEXT,
        createdBy TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        isActive BOOLEAN DEFAULT 1,
        FOREIGN KEY (buildingId) REFERENCES buildings(id),
        FOREIGN KEY (createdBy) REFERENCES users(id)
      )
    `);

    // Create group_members table
    db.run(`
      CREATE TABLE IF NOT EXISTS group_members (
        id TEXT PRIMARY KEY,
        groupId TEXT NOT NULL,
        userId TEXT NOT NULL,
        role TEXT DEFAULT 'member' CHECK(role IN ('admin', 'moderator', 'member')),
        joinedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (groupId) REFERENCES groups(id),
        FOREIGN KEY (userId) REFERENCES users(id),
        UNIQUE(groupId, userId)
      )
    `);

    // Create group_posts table
    db.run(`
      CREATE TABLE IF NOT EXISTS group_posts (
        id TEXT PRIMARY KEY,
        groupId TEXT NOT NULL,
        authorId TEXT NOT NULL,
        content TEXT NOT NULL,
        type TEXT DEFAULT 'general' CHECK(type IN ('general', 'question', 'event', 'appreciation')),
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        likes INTEGER DEFAULT 0,
        FOREIGN KEY (groupId) REFERENCES groups(id),
        FOREIGN KEY (authorId) REFERENCES users(id)
      )
    `);

    // Create group_comments table
    db.run(`
      CREATE TABLE IF NOT EXISTS group_comments (
        id TEXT PRIMARY KEY,
        postId TEXT NOT NULL,
        authorId TEXT NOT NULL,
        content TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (postId) REFERENCES group_posts(id),
        FOREIGN KEY (authorId) REFERENCES users(id)
      )
    `);

    // Insert sample data
    insertSampleData();
  });
}

// Insert sample data
function insertSampleData() {
  // Check if data already exists
  db.get("SELECT COUNT(*) as count FROM buildings", (err, row) => {
    if (err) {
      console.error('Error checking sample data:', err);
      return;
    }
    
    if (row.count === 0) {
      console.log('Inserting sample data...');
      
      // Insert sample building
      const buildingId = uuidv4();
      db.run(`INSERT INTO buildings (id, name, address, description, totalApartments) 
              VALUES (?, ?, ?, ?, ?)`, 
        [buildingId, 'Edificio Central', 'Av. Corrientes 1234, Buenos Aires', 'Edificio residencial de lujo en el centro de Buenos Aires', 12]);

      // Insert sample users
      const adminId = uuidv4();
      const tenant1Id = uuidv4();
      const tenant2Id = uuidv4();
      
      bcrypt.hash('admin123', 10).then(hash => {
        db.run(`INSERT INTO users (id, name, email, password, phone, userType, apartment, buildingId) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
          [adminId, 'Admin User', 'admin@example.com', hash, '+54 11 1234-5678', 'property-manager', 'Admin', buildingId]);
      });

      bcrypt.hash('tenant123', 10).then(hash => {
        db.run(`INSERT INTO users (id, name, email, password, phone, userType, apartment, buildingId) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
          [tenant1Id, 'María González', 'maria@example.com', hash, '+54 11 2345-6789', 'tenant', '3A', buildingId]);
      });

      bcrypt.hash('tenant123', 10).then(hash => {
        db.run(`INSERT INTO users (id, name, email, password, phone, userType, apartment, buildingId) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
          [tenant2Id, 'Carlos Rodríguez', 'carlos@example.com', hash, '+54 11 3456-7890', 'tenant', '1B', buildingId]);
      });

      // Insert sample maintenance requests
      const request1Id = uuidv4();
      const request2Id = uuidv4();
      
      db.run(`INSERT INTO maintenance_requests (id, title, description, status, priority, submittedBy, apartment, buildingId, estimatedCost) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
        [request1Id, 'Fuga de agua en baño', 'Hay una fuga de agua en el baño del departamento 3A', 'pending', 'high', tenant1Id, '3A', buildingId, 25000]);

      db.run(`INSERT INTO maintenance_requests (id, title, description, status, priority, submittedBy, apartment, buildingId, estimatedCost) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
        [request2Id, 'Ascensor fuera de servicio', 'El ascensor del edificio principal no funciona', 'in-progress', 'critical', adminId, 'Admin', buildingId, 150000]);

      // Insert sample community posts
      const post1Id = uuidv4();
      const post2Id = uuidv4();
      
      db.run(`INSERT INTO community_posts (id, author, apartment, content, type, likes, comments, buildingId) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
        [post1Id, tenant1Id, '3A', '¿Alguien sabe si hay algún evento en el barrio este fin de semana?', 'question', 8, 3, buildingId]);

      db.run(`INSERT INTO community_posts (id, author, apartment, content, type, likes, comments, buildingId) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
        [post2Id, tenant2Id, '1B', 'Excelente trabajo del personal de limpieza hoy. ¡El edificio se ve impecable!', 'appreciation', 12, 1, buildingId]);

      // Insert sample payments
      const payment1Id = uuidv4();
      const payment2Id = uuidv4();
      
      db.run(`INSERT INTO payments (id, tenantId, apartment, amount, type, date, status, method, buildingId) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
        [payment1Id, tenant1Id, '3A', 85000, 'rent', '2024-01-25', 'paid', 'transfer', buildingId]);

      db.run(`INSERT INTO payments (id, tenantId, apartment, amount, type, date, status, method, buildingId) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
        [payment2Id, tenant2Id, '1B', 92000, 'rent', '2024-01-25', 'pending', 'cash', buildingId]);

      // Insert sample invitations
      const invitation1Id = uuidv4();
      const invitation2Id = uuidv4();
      const invitation3Id = uuidv4();

      db.run(`INSERT INTO invitations (id, email, apartment, name, phone, rentAmount, invitedBy, buildingId, invitationToken, expiresAt) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
        [invitation1Id, 'tenant3@example.com', '4C', 'New Tenant', '+54 11 4567-8901', 100000, adminId, buildingId, uuidv4(), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()]);

      db.run(`INSERT INTO invitations (id, email, apartment, name, phone, rentAmount, invitedBy, buildingId, invitationToken, expiresAt) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
        [invitation2Id, 'tenant4@example.com', '5D', 'Another Tenant', '+54 11 5678-9012', 80000, adminId, buildingId, uuidv4(), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()]);

      db.run(`INSERT INTO invitations (id, email, apartment, name, phone, rentAmount, invitedBy, buildingId, invitationToken, expiresAt) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
        [invitation3Id, 'tenant5@example.com', '6E', 'Yet Another Tenant', '+54 11 6789-0123', 95000, adminId, buildingId, uuidv4(), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()]);

      // Insert sample groups
      const group1Id = uuidv4();
      const group2Id = uuidv4();
      const group3Id = uuidv4();
      
      db.run(`
        INSERT OR IGNORE INTO groups (id, name, description, type, buildingId, createdBy)
        VALUES 
          (?, 'Building Community', 'General community group for building residents', 'building', ?, ?),
          (?, 'Buenos Aires Property Owners', 'Network for property owners in Buenos Aires', 'public', NULL, ?),
          (?, 'Maintenance Tips & Tricks', 'Share maintenance tips and advice', 'public', NULL, ?)
      `, [group1Id, buildingId, adminId, group2Id, adminId, group3Id, adminId]);

      // Add members to groups
      db.run(`
        INSERT OR IGNORE INTO group_members (id, groupId, userId, role)
        VALUES 
          (?, ?, ?, 'admin'),
          (?, ?, ?, 'member'),
          (?, ?, ?, 'member'),
          (?, ?, ?, 'admin'),
          (?, ?, ?, 'member'),
          (?, ?, ?, 'admin'),
          (?, ?, ?, 'member')
      `, [
        uuidv4(), group1Id, adminId,
        uuidv4(), group1Id, tenant1Id,
        uuidv4(), group1Id, tenant2Id,
        uuidv4(), group2Id, adminId,
        uuidv4(), group2Id, tenant1Id,
        uuidv4(), group3Id, adminId,
        uuidv4(), group3Id, tenant2Id
      ]);

      // Insert sample group posts
      const groupPost1Id = uuidv4();
      const groupPost2Id = uuidv4();
      const groupPost3Id = uuidv4();
      
      db.run(`
        INSERT OR IGNORE INTO group_posts (id, groupId, authorId, content, type)
        VALUES 
          (?, ?, ?, 'Welcome everyone to our building community! Feel free to share updates and connect with your neighbors.', 'general'),
          (?, ?, ?, 'Does anyone have recommendations for a good plumber in the area?', 'question'),
          (?, ?, ?, 'Great tips for maintaining your apartment during winter months', 'general')
      `, [groupPost1Id, group1Id, adminId, groupPost2Id, group1Id, tenant1Id, groupPost3Id, group3Id, adminId]);

      console.log('Sample data inserted successfully');
    }
  });
}

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
};

// Helper function to get user by ID
const getUserById = (userId) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE id = ?', [userId], (err, user) => {
      if (err) {
        reject(err);
      } else {
        resolve(user);
      }
    });
  });
};

// Routes

// Authentication routes
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, phone, userType, apartment, buildingId } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    db.run(`INSERT INTO users (id, name, email, password, phone, userType, apartment, buildingId) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
      [userId, name, email, hashedPassword, phone, userType, apartment, buildingId], 
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Email already exists' });
          }
          return res.status(500).json({ error: 'Error creating user' });
        }

        const token = jwt.sign({ id: userId, email, userType }, JWT_SECRET);
        res.json({ token, user: { id: userId, name, email, userType, apartment, buildingId } });
      });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    try {
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user.id, email: user.email, userType: user.userType }, JWT_SECRET);
      res.json({ 
        token, 
        user: { 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          userType: user.userType, 
          apartment: user.apartment, 
          buildingId: user.buildingId 
        } 
      });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });
});

// Dashboard metrics
app.get('/api/dashboard/metrics', authenticateToken, (req, res) => {
  const buildingId = req.user.buildingId;

  db.get(`SELECT 
    COUNT(DISTINCT u.id) as totalProperties,
    COUNT(CASE WHEN u.userType = 'tenant' THEN 1 END) as activeTenants,
    COUNT(CASE WHEN mr.status = 'pending' THEN 1 END) as pendingRequests,
    COALESCE(SUM(CASE WHEN p.status = 'paid' THEN p.amount END), 0) as monthlyRevenue,
    COALESCE(SUM(mr.estimatedCost), 0) as maintenanceCosts,
    ROUND((COUNT(CASE WHEN u.userType = 'tenant' THEN 1 END) * 100.0 / COUNT(DISTINCT u.id)), 1) as occupancyRate
    FROM users u
    LEFT JOIN maintenance_requests mr ON u.buildingId = mr.buildingId
    LEFT JOIN payments p ON u.buildingId = p.buildingId AND p.date >= date('now', 'start of month')
    WHERE u.buildingId = ?`, [buildingId], (err, metrics) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(metrics);
  });
});

// Maintenance requests
app.get('/api/maintenance-requests', authenticateToken, (req, res) => {
  const buildingId = req.user.buildingId;

  db.all(`SELECT mr.*, u.name as submittedByName 
          FROM maintenance_requests mr 
          JOIN users u ON mr.submittedBy = u.id 
          WHERE mr.buildingId = ? 
          ORDER BY mr.submittedDate DESC`, [buildingId], (err, requests) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(requests);
  });
});

app.post('/api/maintenance-requests', authenticateToken, (req, res) => {
  const { title, description, priority, apartment } = req.body;
  const requestId = uuidv4();

  db.run(`INSERT INTO maintenance_requests (id, title, description, priority, submittedBy, apartment, buildingId) 
          VALUES (?, ?, ?, ?, ?, ?, ?)`, 
    [requestId, title, description, priority, req.user.id, apartment, req.user.buildingId], 
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error creating request' });
      }
      res.json({ id: requestId, message: 'Request created successfully' });
    });
});

// Community posts
app.get('/api/community-posts', authenticateToken, (req, res) => {
  const buildingId = req.user.buildingId;

  db.all(`SELECT cp.*, u.name as authorName 
          FROM community_posts cp 
          JOIN users u ON cp.author = u.id 
          WHERE cp.buildingId = ? 
          ORDER BY cp.timestamp DESC`, [buildingId], (err, posts) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(posts);
  });
});

app.post('/api/community-posts', authenticateToken, (req, res) => {
  const { content, type } = req.body;
  const postId = uuidv4();

  db.run(`INSERT INTO community_posts (id, author, apartment, content, type, buildingId) 
          VALUES (?, ?, ?, ?, ?, ?)`, 
    [postId, req.user.id, req.user.apartment, content, type, req.user.buildingId], 
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error creating post' });
      }
      res.json({ id: postId, message: 'Post created successfully' });
    });
});

// Tenants
app.get('/api/tenants', authenticateToken, (req, res) => {
  const buildingId = req.user.buildingId;

  db.all(`SELECT id, name, email, phone, apartment, userType, createdAt 
          FROM users 
          WHERE buildingId = ? AND userType = 'tenant' 
          ORDER BY name`, [buildingId], (err, tenants) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(tenants);
  });
});

// Payments
app.get('/api/payments', authenticateToken, (req, res) => {
  const buildingId = req.user.buildingId;

  db.all(`SELECT p.*, u.name as tenantName 
          FROM payments p 
          JOIN users u ON p.tenantId = u.id 
          WHERE p.buildingId = ? 
          ORDER BY p.date DESC`, [buildingId], (err, payments) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(payments);
  });
});

app.post('/api/payments', authenticateToken, (req, res) => {
  const { tenantId, amount, type, date, method, notes } = req.body;
  const paymentId = uuidv4();

  db.run(`INSERT INTO payments (id, tenantId, apartment, amount, type, date, method, notes, buildingId) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
    [paymentId, tenantId, req.user.apartment, amount, type, date, method, notes, req.user.buildingId], 
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error creating payment' });
      }
      res.json({ id: paymentId, message: 'Payment created successfully' });
    });
});

// Invitations
app.get('/api/invitations', authenticateToken, (req, res) => {
  const buildingId = req.user.buildingId;

  db.all(`SELECT * FROM invitations WHERE buildingId = ? ORDER BY invitedDate DESC`, [buildingId], (err, invitations) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(invitations);
  });
});

app.post('/api/invitations', authenticateToken, (req, res) => {
  const { email, apartment, name, phone, rentAmount, userType } = req.body;
  const invitationId = uuidv4();
  const invitationToken = uuidv4();
  const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

  db.run(`INSERT INTO invitations (id, email, apartment, name, phone, rentAmount, invitedBy, buildingId, invitationToken, expiresAt) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
    [invitationId, email, apartment, name, phone, rentAmount, req.user.id, req.user.buildingId, invitationToken, expiresAt], 
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error creating invitation' });
      }
      
      // Here you would send the actual email
      console.log(`Invitation sent to ${email} with token: ${invitationToken}`);
      
      res.json({ id: invitationId, message: 'Invitation sent successfully' });
    });
});

// User profile
app.get('/api/user/profile', authenticateToken, (req, res) => {
  db.get(`SELECT u.*, b.name as buildingName, b.address as buildingAddress, b.description as buildingDescription, b.totalApartments
          FROM users u 
          LEFT JOIN buildings b ON u.buildingId = b.id 
          WHERE u.id = ?`, [req.user.id], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Remove password from response
    delete user.password;
    res.json(user);
  });
});

app.put('/api/user/profile', authenticateToken, (req, res) => {
  const { name, phone } = req.body;

  db.run(`UPDATE users SET name = ?, phone = ? WHERE id = ?`, 
    [name, phone, req.user.id], 
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error updating profile' });
      }
      res.json({ message: 'Profile updated successfully' });
    });
});

// Groups API endpoints
app.get('/api/groups', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await getUserById(userId);
    
    let query = `
      SELECT g.*, 
             u.name as creatorName,
             b.name as buildingName,
             (SELECT COUNT(*) FROM group_members WHERE groupId = g.id) as memberCount,
             (SELECT COUNT(*) FROM group_posts WHERE groupId = g.id) as postCount
      FROM groups g
      LEFT JOIN users u ON g.createdBy = u.id
      LEFT JOIN buildings b ON g.buildingId = b.id
      WHERE g.isActive = 1
    `;
    
    const params = [];
    
    // If user is in a building, show building groups and public groups
    if (user.buildingId) {
      query += ` AND (g.type = 'public' OR (g.type = 'building' AND g.buildingId = ?))`;
      params.push(user.buildingId);
    } else {
      // If user is not in a building, only show public groups
      query += ` AND g.type = 'public'`;
    }
    
    query += ` ORDER BY g.createdAt DESC`;
    
    db.all(query, params, (err, groups) => {
      if (err) {
        console.error('Error fetching groups:', err);
        return res.status(500).json({ error: 'Failed to fetch groups' });
      }
      
      // Check if user is a member of each group
      const groupsWithMembership = groups.map(group => ({
        ...group,
        isMember: false // Will be updated below
      }));
      
      if (groupsWithMembership.length === 0) {
        return res.json(groupsWithMembership);
      }
      
      const groupIds = groupsWithMembership.map(g => g.id);
      const membershipQuery = `SELECT groupId FROM group_members WHERE userId = ? AND groupId IN (${groupIds.map(() => '?').join(',')})`;
      
      db.all(membershipQuery, [userId, ...groupIds], (err, memberships) => {
        if (err) {
          console.error('Error checking memberships:', err);
          return res.status(500).json({ error: 'Failed to check memberships' });
        }
        
        const userGroupIds = memberships.map(m => m.groupId);
        groupsWithMembership.forEach(group => {
          group.isMember = userGroupIds.includes(group.id);
        });
        
        res.json(groupsWithMembership);
      });
    });
  } catch (error) {
    console.error('Error in groups endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new group
app.post('/api/groups', authenticateToken, async (req, res) => {
  try {
    const { name, description, type, buildingId } = req.body;
    const userId = req.user.id;
    
    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type are required' });
    }
    
    if (type === 'building' && !buildingId) {
      return res.status(400).json({ error: 'Building ID is required for building groups' });
    }
    
    const groupId = uuidv4();
    
    db.run(`
      INSERT INTO groups (id, name, description, type, buildingId, createdBy)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [groupId, name, description, type, buildingId, userId], function(err) {
      if (err) {
        console.error('Error creating group:', err);
        return res.status(500).json({ error: 'Failed to create group' });
      }
      
      // Add creator as admin member
      const memberId = uuidv4();
      db.run(`
        INSERT INTO group_members (id, groupId, userId, role)
        VALUES (?, ?, ?, 'admin')
      `, [memberId, groupId, userId], function(err) {
        if (err) {
          console.error('Error adding creator to group:', err);
        }
        
        res.json({ 
          id: groupId, 
          name, 
          description, 
          type, 
          buildingId, 
          createdBy: userId,
          message: 'Group created successfully' 
        });
      });
    });
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Join a group
app.post('/api/groups/:groupId/join', authenticateToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;
    
    // Check if group exists and user can join
    db.get('SELECT * FROM groups WHERE id = ? AND isActive = 1', [groupId], (err, group) => {
      if (err || !group) {
        return res.status(404).json({ error: 'Group not found' });
      }
      
      // Check if user is already a member
      db.get('SELECT * FROM group_members WHERE groupId = ? AND userId = ?', [groupId, userId], (err, member) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to check membership' });
        }
        
        if (member) {
          return res.status(400).json({ error: 'Already a member of this group' });
        }
        
        // Add user to group
        const memberId = uuidv4();
        db.run(`
          INSERT INTO group_members (id, groupId, userId)
          VALUES (?, ?, ?)
        `, [memberId, groupId, userId], function(err) {
          if (err) {
            console.error('Error joining group:', err);
            return res.status(500).json({ error: 'Failed to join group' });
          }
          
          res.json({ message: 'Successfully joined group' });
        });
      });
    });
  } catch (error) {
    console.error('Error joining group:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Leave a group
app.delete('/api/groups/:groupId/leave', authenticateToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;
    
    db.run('DELETE FROM group_members WHERE groupId = ? AND userId = ?', [groupId, userId], function(err) {
      if (err) {
        console.error('Error leaving group:', err);
        return res.status(500).json({ error: 'Failed to leave group' });
      }
      
      res.json({ message: 'Successfully left group' });
    });
  } catch (error) {
    console.error('Error leaving group:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get group posts
app.get('/api/groups/:groupId/posts', authenticateToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;
    
    // Check if user is a member of the group
    db.get('SELECT * FROM group_members WHERE groupId = ? AND userId = ?', [groupId, userId], (err, member) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to check membership' });
      }
      
      if (!member) {
        return res.status(403).json({ error: 'Not a member of this group' });
      }
      
      // Get posts with author information
      db.all(`
        SELECT p.*, u.name as authorName, u.apartment as authorApartment
        FROM group_posts p
        JOIN users u ON p.authorId = u.id
        WHERE p.groupId = ?
        ORDER BY p.createdAt DESC
      `, [groupId], (err, posts) => {
        if (err) {
          console.error('Error fetching posts:', err);
          return res.status(500).json({ error: 'Failed to fetch posts' });
        }
        
        res.json(posts);
      });
    });
  } catch (error) {
    console.error('Error fetching group posts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a group post
app.post('/api/groups/:groupId/posts', authenticateToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { content, type = 'general' } = req.body;
    const userId = req.user.id;
    
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }
    
    // Check if user is a member of the group
    db.get('SELECT * FROM group_members WHERE groupId = ? AND userId = ?', [groupId, userId], (err, member) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to check membership' });
      }
      
      if (!member) {
        return res.status(403).json({ error: 'Not a member of this group' });
      }
      
      const postId = uuidv4();
      db.run(`
        INSERT INTO group_posts (id, groupId, authorId, content, type)
        VALUES (?, ?, ?, ?, ?)
      `, [postId, groupId, userId, content, type], function(err) {
        if (err) {
          console.error('Error creating post:', err);
          return res.status(500).json({ error: 'Failed to create post' });
        }
        
        res.json({ 
          id: postId, 
          groupId, 
          authorId: userId, 
          content, 
          type,
          message: 'Post created successfully' 
        });
      });
    });
  } catch (error) {
    console.error('Error creating group post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
