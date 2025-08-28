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

    // Create business_categories table
    db.run(`
      CREATE TABLE IF NOT EXISTS business_categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        icon TEXT,
        color TEXT DEFAULT '#3B82F6',
        isActive BOOLEAN DEFAULT 1,
        sortOrder INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create businesses table
    db.run(`
      CREATE TABLE IF NOT EXISTS businesses (
        id TEXT PRIMARY KEY,
        ownerId TEXT NOT NULL,
        name TEXT NOT NULL,
        categoryId TEXT NOT NULL,
        description TEXT,
        address TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        website TEXT,
        hours TEXT,
        latitude REAL,
        longitude REAL,
        status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
        verifiedAt DATETIME,
        verifiedBy TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ownerId) REFERENCES users(id),
        FOREIGN KEY (categoryId) REFERENCES business_categories(id),
        FOREIGN KEY (verifiedBy) REFERENCES users(id)
      )
    `);

    // Create indexes for search performance
    db.run(`CREATE INDEX IF NOT EXISTS idx_businesses_status ON businesses (status)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_businesses_category ON businesses (categoryId)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_businesses_location ON businesses (latitude, longitude)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_businesses_name ON businesses (name)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_businesses_created ON businesses (createdAt)`);

    // Create business_reviews table
    db.run(`
      CREATE TABLE IF NOT EXISTS business_reviews (
        id TEXT PRIMARY KEY,
        businessId TEXT NOT NULL,
        reviewerId TEXT NOT NULL,
        rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
        comment TEXT,
        status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected', 'flagged')),
        isVerified BOOLEAN DEFAULT 0,
        helpfulCount INTEGER DEFAULT 0,
        notHelpfulCount INTEGER DEFAULT 0,
        spamScore REAL DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (businessId) REFERENCES businesses(id),
        FOREIGN KEY (reviewerId) REFERENCES users(id)
      )
    `);

    // Create review_photos table
    db.run(`
      CREATE TABLE IF NOT EXISTS review_photos (
        id TEXT PRIMARY KEY,
        reviewId TEXT NOT NULL,
        photoUrl TEXT NOT NULL,
        caption TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (reviewId) REFERENCES business_reviews(id) ON DELETE CASCADE
      )
    `);

    // Create review_responses table
    db.run(`
      CREATE TABLE IF NOT EXISTS review_responses (
        id TEXT PRIMARY KEY,
        reviewId TEXT NOT NULL,
        businessId TEXT NOT NULL,
        responderId TEXT NOT NULL,
        response TEXT NOT NULL,
        status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (reviewId) REFERENCES business_reviews(id) ON DELETE CASCADE,
        FOREIGN KEY (businessId) REFERENCES businesses(id),
        FOREIGN KEY (responderId) REFERENCES users(id)
      )
    `);

    // Create review_votes table
    db.run(`
      CREATE TABLE IF NOT EXISTS review_votes (
        id TEXT PRIMARY KEY,
        reviewId TEXT NOT NULL,
        voterId TEXT NOT NULL,
        voteType TEXT NOT NULL CHECK(voteType IN ('helpful', 'not_helpful')),
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (reviewId) REFERENCES business_reviews(id) ON DELETE CASCADE,
        FOREIGN KEY (voterId) REFERENCES users(id),
        UNIQUE(reviewId, voterId)
      )
    `);

    // Create review_reports table
    db.run(`
      CREATE TABLE IF NOT EXISTS review_reports (
        id TEXT PRIMARY KEY,
        reviewId TEXT NOT NULL,
        reporterId TEXT NOT NULL,
        reason TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'investigating', 'resolved', 'dismissed')),
        adminNotes TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        resolvedAt DATETIME,
        resolvedBy TEXT,
        FOREIGN KEY (reviewId) REFERENCES business_reviews(id) ON DELETE CASCADE,
        FOREIGN KEY (reporterId) REFERENCES users(id),
        FOREIGN KEY (resolvedBy) REFERENCES users(id)
      )
    `);

    // Create review_notifications table
    db.run(`
      CREATE TABLE IF NOT EXISTS review_notifications (
        id TEXT PRIMARY KEY,
        businessId TEXT NOT NULL,
        userId TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('new_review', 'review_response', 'review_report', 'review_approved', 'review_rejected')),
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        isRead BOOLEAN DEFAULT 0,
        relatedReviewId TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (businessId) REFERENCES businesses(id),
        FOREIGN KEY (userId) REFERENCES users(id),
        FOREIGN KEY (relatedReviewId) REFERENCES business_reviews(id) ON DELETE CASCADE
      )
    `);

    // Create indexes for review performance
    db.run(`CREATE INDEX IF NOT EXISTS idx_reviews_business ON business_reviews (businessId)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_reviews_status ON business_reviews (status)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_reviews_rating ON business_reviews (rating)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_reviews_created ON business_reviews (createdAt)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_reviews_verified ON business_reviews (isVerified)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_reviews_spam ON business_reviews (spamScore)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_review_votes_review ON review_votes (reviewId)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_review_votes_voter ON review_votes (voterId)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_review_reports_review ON review_reports (reviewId)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_review_reports_status ON review_reports (status)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_review_notifications_user ON review_notifications (userId)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_review_notifications_read ON review_notifications (isRead)`);

    // Create business_analytics table
    db.run(`
      CREATE TABLE IF NOT EXISTS business_analytics (
        id TEXT PRIMARY KEY,
        businessId TEXT NOT NULL,
        date DATE NOT NULL,
        views INTEGER DEFAULT 0,
        contacts INTEGER DEFAULT 0,
        reviews INTEGER DEFAULT 0,
        averageRating REAL DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (businessId) REFERENCES businesses(id),
        UNIQUE(businessId, date)
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

      // Insert sample business categories
      const categoryIds = {
        restaurants: uuidv4(),
        retail: uuidv4(),
        services: uuidv4(),
        healthcare: uuidv4(),
        entertainment: uuidv4(),
        cleaning: uuidv4(),
        plumbing: uuidv4(),
        grocery: uuidv4(),
        pharmacy: uuidv4(),
        beauty: uuidv4(),
        fitness: uuidv4(),
        other: uuidv4()
      };

      // Insert categories
      db.run(`INSERT INTO business_categories (id, name, description, icon, color, sortOrder) VALUES (?, ?, ?, ?, ?, ?)`,
        [categoryIds.restaurants, 'Restaurants', 'Food and dining establishments', 'utensils', '#EF4444', 1]);
      
      db.run(`INSERT INTO business_categories (id, name, description, icon, color, sortOrder) VALUES (?, ?, ?, ?, ?, ?)`,
        [categoryIds.retail, 'Retail', 'Shopping and retail stores', 'shopping-bag', '#3B82F6', 2]);
      
      db.run(`INSERT INTO business_categories (id, name, description, icon, color, sortOrder) VALUES (?, ?, ?, ?, ?, ?)`,
        [categoryIds.services, 'Services', 'Professional and business services', 'briefcase', '#10B981', 3]);
      
      db.run(`INSERT INTO business_categories (id, name, description, icon, color, sortOrder) VALUES (?, ?, ?, ?, ?, ?)`,
        [categoryIds.healthcare, 'Healthcare', 'Medical and health services', 'heart-pulse', '#F59E0B', 4]);
      
      db.run(`INSERT INTO business_categories (id, name, description, icon, color, sortOrder) VALUES (?, ?, ?, ?, ?, ?)`,
        [categoryIds.entertainment, 'Entertainment', 'Entertainment and leisure', 'music', '#8B5CF6', 5]);
      
      db.run(`INSERT INTO business_categories (id, name, description, icon, color, sortOrder) VALUES (?, ?, ?, ?, ?, ?)`,
        [categoryIds.cleaning, 'Cleaning', 'Cleaning and maintenance services', 'sparkles', '#06B6D4', 6]);
      
      db.run(`INSERT INTO business_categories (id, name, description, icon, color, sortOrder) VALUES (?, ?, ?, ?, ?, ?)`,
        [categoryIds.plumbing, 'Plumbing', 'Plumbing and repair services', 'wrench', '#84CC16', 7]);
      
      db.run(`INSERT INTO business_categories (id, name, description, icon, color, sortOrder) VALUES (?, ?, ?, ?, ?, ?)`,
        [categoryIds.grocery, 'Grocery', 'Grocery and convenience stores', 'shopping-cart', '#F97316', 8]);
      
      db.run(`INSERT INTO business_categories (id, name, description, icon, color, sortOrder) VALUES (?, ?, ?, ?, ?, ?)`,
        [categoryIds.pharmacy, 'Pharmacy', 'Pharmacy and drug stores', 'pill', '#EC4899', 9]);
      
      db.run(`INSERT INTO business_categories (id, name, description, icon, color, sortOrder) VALUES (?, ?, ?, ?, ?, ?)`,
        [categoryIds.beauty, 'Beauty', 'Beauty and personal care', 'scissors', '#A855F7', 10]);
      
      db.run(`INSERT INTO business_categories (id, name, description, icon, color, sortOrder) VALUES (?, ?, ?, ?, ?, ?)`,
        [categoryIds.fitness, 'Fitness', 'Fitness and wellness centers', 'dumbbell', '#14B8A6', 11]);
      
      db.run(`INSERT INTO business_categories (id, name, description, icon, color, sortOrder) VALUES (?, ?, ?, ?, ?, ?)`,
        [categoryIds.other, 'Other', 'Other business categories', 'more-horizontal', '#6B7280', 12]);

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

// ==================== BUSINESS MANAGEMENT ENDPOINTS ====================

// Register a new business
app.post('/api/businesses/register', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      category,
      description,
      address,
      phone,
      email,
      website,
      hours
    } = req.body;
    const ownerId = req.user.id;

    if (!name || !category || !address) {
      return res.status(400).json({ error: 'Name, category, and address are required' });
    }

    // Check if user already has a business
    db.get('SELECT * FROM businesses WHERE ownerId = ?', [ownerId], (err, existingBusiness) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (existingBusiness) {
        return res.status(400).json({ error: 'You already have a registered business' });
      }

      const businessId = uuidv4();
      db.run(`
        INSERT INTO businesses (id, ownerId, name, category, description, address, phone, email, website, hours)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [businessId, ownerId, name, category, description, address, phone, email, website, hours], function(err) {
        if (err) {
          console.error('Error creating business:', err);
          return res.status(500).json({ error: 'Failed to create business' });
        }

        res.json({ 
          message: 'Business registered successfully',
          businessId: businessId
        });
      });
    });
  } catch (error) {
    console.error('Error registering business:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get business profile
app.get('/api/businesses/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    db.get(`
      SELECT b.*, u.name as ownerName, u.email as ownerEmail
      FROM businesses b
      JOIN users u ON b.ownerId = u.id
      WHERE b.ownerId = ?
    `, [userId], (err, business) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!business) {
        return res.status(404).json({ error: 'Business not found' });
      }

      res.json(business);
    });
  } catch (error) {
    console.error('Error fetching business profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update business profile
app.put('/api/businesses/profile', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      category,
      description,
      address,
      phone,
      email,
      website,
      hours
    } = req.body;
    const userId = req.user.id;

    if (!name || !category || !address) {
      return res.status(400).json({ error: 'Name, category, and address are required' });
    }

    db.run(`
      UPDATE businesses 
      SET name = ?, category = ?, description = ?, address = ?, phone = ?, email = ?, website = ?, hours = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE ownerId = ?
    `, [name, category, description, address, phone, email, website, hours, userId], function(err) {
      if (err) {
        console.error('Error updating business:', err);
        return res.status(500).json({ error: 'Failed to update business' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Business not found' });
      }

      res.json({ message: 'Business profile updated successfully' });
    });
  } catch (error) {
    console.error('Error updating business profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get business reviews
app.get('/api/businesses/reviews', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // First get the business
    db.get('SELECT id FROM businesses WHERE ownerId = ?', [userId], (err, business) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!business) {
        return res.status(404).json({ error: 'Business not found' });
      }

      // Get reviews with reviewer information
      db.all(`
        SELECT r.*, u.name as reviewerName, u.apartment as reviewerApartment
        FROM business_reviews r
        JOIN users u ON r.reviewerId = u.id
        WHERE r.businessId = ?
        ORDER BY r.createdAt DESC
      `, [business.id], (err, reviews) => {
        if (err) {
          console.error('Error fetching reviews:', err);
          return res.status(500).json({ error: 'Failed to fetch reviews' });
        }

        res.json(reviews);
      });
    });
  } catch (error) {
    console.error('Error fetching business reviews:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get business analytics
app.get('/api/businesses/analytics', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = '30' } = req.query; // days

    // First get the business
    db.get('SELECT id FROM businesses WHERE ownerId = ?', [userId], (err, business) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!business) {
        return res.status(404).json({ error: 'Business not found' });
      }

      // Get analytics for the specified period
      db.all(`
        SELECT * FROM business_analytics 
        WHERE businessId = ? AND date >= date('now', '-${period} days')
        ORDER BY date DESC
      `, [business.id], (err, analytics) => {
        if (err) {
          console.error('Error fetching analytics:', err);
          return res.status(500).json({ error: 'Failed to fetch analytics' });
        }

        // Calculate summary statistics
        const summary = analytics.reduce((acc, day) => {
          acc.totalViews += day.views;
          acc.totalContacts += day.contacts;
          acc.totalReviews += day.reviews;
          acc.averageRating = (acc.averageRating + day.averageRating) / 2;
          return acc;
        }, { totalViews: 0, totalContacts: 0, totalReviews: 0, averageRating: 0 });

        res.json({ analytics, summary });
      });
    });
  } catch (error) {
    console.error('Error fetching business analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== ADMIN BUSINESS MANAGEMENT ENDPOINTS ====================

// Get all businesses for admin approval
app.get('/api/admin/businesses', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'property-manager') {
      return res.status(403).json({ error: 'Access denied' });
    }

    db.all(`
      SELECT b.*, u.name as ownerName, u.email as ownerEmail
      FROM businesses b
      JOIN users u ON b.ownerId = u.id
      ORDER BY b.createdAt DESC
    `, (err, businesses) => {
      if (err) {
        console.error('Error fetching businesses:', err);
        return res.status(500).json({ error: 'Failed to fetch businesses' });
      }

      res.json(businesses);
    });
  } catch (error) {
    console.error('Error fetching businesses for admin:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Approve/reject business
app.put('/api/admin/businesses/:businessId/status', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'property-manager') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { businessId } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    db.run(`
      UPDATE businesses 
      SET status = ?, verifiedAt = CURRENT_TIMESTAMP, verifiedBy = ?
      WHERE id = ?
    `, [status, req.user.id, businessId], function(err) {
      if (err) {
        console.error('Error updating business status:', err);
        return res.status(500).json({ error: 'Failed to update business status' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Business not found' });
      }

      res.json({ message: `Business ${status} successfully` });
    });
  } catch (error) {
    console.error('Error updating business status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get business details for admin
app.get('/api/admin/businesses/:businessId', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'property-manager') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { businessId } = req.params;

    db.get(`
      SELECT b.*, u.name as ownerName, u.email as ownerEmail, u.phone as ownerPhone
      FROM businesses b
      JOIN users u ON b.ownerId = u.id
      WHERE b.id = ?
    `, [businessId], (err, business) => {
      if (err) {
        console.error('Error fetching business details:', err);
        return res.status(500).json({ error: 'Failed to fetch business details' });
      }

      if (!business) {
        return res.status(404).json({ error: 'Business not found' });
      }

      res.json(business);
    });
  } catch (error) {
    console.error('Error fetching business details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== PUBLIC BUSINESS ENDPOINTS ====================

// Get all approved businesses
app.get('/api/businesses', async (req, res) => {
  try {
    db.all(`
      SELECT b.*, u.name as ownerName,
             (SELECT COUNT(*) FROM business_reviews WHERE businessId = b.id) as reviewCount,
             (SELECT AVG(rating) FROM business_reviews WHERE businessId = b.id) as averageRating
      FROM businesses b
      JOIN users u ON b.ownerId = u.id
      WHERE b.status = 'approved'
      ORDER BY b.name
    `, (err, businesses) => {
      if (err) {
        console.error('Error fetching businesses:', err);
        return res.status(500).json({ error: 'Failed to fetch businesses' });
      }

      res.json(businesses);
    });
  } catch (error) {
    console.error('Error fetching businesses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get business details
app.get('/api/businesses/:businessId', async (req, res) => {
  try {
    const { businessId } = req.params;

    db.get(`
      SELECT b.*, u.name as ownerName,
             (SELECT COUNT(*) FROM business_reviews WHERE businessId = b.id) as reviewCount,
             (SELECT AVG(rating) FROM business_reviews WHERE businessId = b.id) as averageRating
      FROM businesses b
      JOIN users u ON b.ownerId = u.id
      WHERE b.id = ? AND b.status = 'approved'
    `, [businessId], (err, business) => {
      if (err) {
        console.error('Error fetching business details:', err);
        return res.status(500).json({ error: 'Failed to fetch business details' });
      }

      if (!business) {
        return res.status(404).json({ error: 'Business not found' });
      }

      res.json(business);
    });
  } catch (error) {
    console.error('Error fetching business details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add business review with enhanced features
app.post('/api/businesses/:businessId/reviews', authenticateToken, async (req, res) => {
  try {
    const { businessId } = req.params;
    const { rating, comment, photos } = req.body;
    const reviewerId = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Valid rating (1-5) is required' });
    }

    if (!comment || comment.trim().length < 10) {
      return res.status(400).json({ error: 'Review comment must be at least 10 characters long' });
    }

    if (comment.length > 1000) {
      return res.status(400).json({ error: 'Review comment cannot exceed 1000 characters' });
    }

    // Check if business exists and is approved
    db.get('SELECT * FROM businesses WHERE id = ? AND status = "approved"', [businessId], (err, business) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!business) {
        return res.status(404).json({ error: 'Business not found or not approved' });
      }

      // Check if user already reviewed this business
      db.get('SELECT * FROM business_reviews WHERE businessId = ? AND reviewerId = ?', [businessId, reviewerId], (err, existingReview) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        if (existingReview) {
          return res.status(400).json({ error: 'You have already reviewed this business' });
        }

        // Calculate spam score
        const spamScore = calculateSpamScore(comment, reviewerId);

        const reviewId = uuidv4();
        db.run(`
          INSERT INTO business_reviews (id, businessId, reviewerId, rating, comment, spamScore, status)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [reviewId, businessId, reviewerId, rating, comment, spamScore, spamScore > 0.7 ? 'flagged' : 'pending'], function(err) {
          if (err) {
            console.error('Error creating review:', err);
            return res.status(500).json({ error: 'Failed to create review' });
          }

          // Add photos if provided
          if (photos && photos.length > 0) {
            photos.forEach(photo => {
              const photoId = uuidv4();
              db.run(`
                INSERT INTO review_photos (id, reviewId, photoUrl, caption)
                VALUES (?, ?, ?, ?)
              `, [photoId, reviewId, photo.url, photo.caption || '']);
            });
          }

          // Create notification for business owner
          createReviewNotification(businessId, business.ownerId, 'new_review', reviewId);

          res.json({ 
            message: 'Review added successfully',
            reviewId: reviewId,
            status: spamScore > 0.7 ? 'flagged' : 'pending'
          });
        });
      });
    });
  } catch (error) {
    console.error('Error adding business review:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to calculate spam score
function calculateSpamScore(comment, reviewerId) {
  let score = 0;
  
  // Check for repetitive words
  const words = comment.toLowerCase().split(/\s+/);
  const wordCount = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });
  
  Object.values(wordCount).forEach(count => {
    if (count > 3) score += 0.2;
  });

  // Check for all caps
  if (comment === comment.toUpperCase() && comment.length > 10) {
    score += 0.3;
  }

  // Check for excessive punctuation
  const punctuationCount = (comment.match(/[!?]{2,}/g) || []).length;
  score += punctuationCount * 0.1;

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /buy.*now/i,
    /click.*here/i,
    /free.*offer/i,
    /limited.*time/i,
    /\d{10,}/, // Long numbers
    /[A-Z]{5,}/ // All caps words
  ];

  suspiciousPatterns.forEach(pattern => {
    if (pattern.test(comment)) {
      score += 0.2;
    }
  });

  return Math.min(score, 1.0);
}

// Helper function to create review notifications
function createReviewNotification(businessId, userId, type, reviewId) {
  const notificationId = uuidv4();
  let title, message;

  switch (type) {
    case 'new_review':
      title = 'New Review Received';
      message = 'You have received a new review for your business.';
      break;
    case 'review_response':
      title = 'Review Response';
      message = 'Someone has responded to a review.';
      break;
    case 'review_report':
      title = 'Review Reported';
      message = 'A review has been reported and requires attention.';
      break;
    default:
      title = 'Review Update';
      message = 'There has been an update to a review.';
  }

  db.run(`
    INSERT INTO review_notifications (id, businessId, userId, type, title, message, relatedReviewId)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [notificationId, businessId, userId, type, title, message, reviewId]);
}

// Get business reviews with enhanced features
app.get('/api/businesses/:businessId/reviews', async (req, res) => {
  try {
    const { businessId } = req.params;
    const { status = 'approved', sort = 'newest', limit = 20, offset = 0 } = req.query;

    let orderBy = 'r.createdAt DESC';
    if (sort === 'rating') orderBy = 'r.rating DESC, r.createdAt DESC';
    if (sort === 'helpful') orderBy = 'r.helpfulCount DESC, r.createdAt DESC';

    db.all(`
      SELECT r.*, u.name as reviewerName, u.apartment as reviewerApartment,
             (SELECT COUNT(*) FROM review_photos WHERE reviewId = r.id) as photoCount,
             (SELECT COUNT(*) FROM review_responses WHERE reviewId = r.id AND status = 'approved') as responseCount
      FROM business_reviews r
      JOIN users u ON r.reviewerId = u.id
      WHERE r.businessId = ? AND r.status = ?
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `, [businessId, status, parseInt(limit), parseInt(offset)], (err, reviews) => {
      if (err) {
        console.error('Error fetching business reviews:', err);
        return res.status(500).json({ error: 'Failed to fetch reviews' });
      }

      // Get photos and responses for each review
      Promise.all(reviews.map(review => 
        Promise.all([
          // Get photos
          new Promise((resolve) => {
            db.all('SELECT * FROM review_photos WHERE reviewId = ?', [review.id], (err, photos) => {
              resolve(err ? [] : photos);
            });
          }),
          // Get responses
          new Promise((resolve) => {
            db.all(`
              SELECT rr.*, u.name as responderName
              FROM review_responses rr
              JOIN users u ON rr.responderId = u.id
              WHERE rr.reviewId = ? AND rr.status = 'approved'
              ORDER BY rr.createdAt ASC
            `, [review.id], (err, responses) => {
              resolve(err ? [] : responses);
            });
          })
        ]).then(([photos, responses]) => {
          review.photos = photos;
          review.responses = responses;
        })
      )).then(() => {
        res.json(reviews);
      });
    });
  } catch (error) {
    console.error('Error fetching business reviews:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Vote on review (helpful/not helpful)
app.post('/api/reviews/:reviewId/vote', authenticateToken, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { voteType } = req.body;
    const voterId = req.user.id;

    if (!['helpful', 'not_helpful'].includes(voteType)) {
      return res.status(400).json({ error: 'Invalid vote type' });
    }

    // Check if user already voted
    db.get('SELECT * FROM review_votes WHERE reviewId = ? AND voterId = ?', [reviewId, voterId], (err, existingVote) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (existingVote) {
        // Update existing vote
        db.run('UPDATE review_votes SET voteType = ? WHERE reviewId = ? AND voterId = ?', 
          [voteType, reviewId, voterId], function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to update vote' });
          }
          updateReviewVoteCounts(reviewId);
          res.json({ message: 'Vote updated successfully' });
        });
      } else {
        // Create new vote
        const voteId = uuidv4();
        db.run('INSERT INTO review_votes (id, reviewId, voterId, voteType) VALUES (?, ?, ?, ?)', 
          [voteId, reviewId, voterId, voteType], function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to create vote' });
          }
          updateReviewVoteCounts(reviewId);
          res.json({ message: 'Vote added successfully' });
        });
      }
    });
  } catch (error) {
    console.error('Error voting on review:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to update review vote counts
function updateReviewVoteCounts(reviewId) {
  db.get('SELECT COUNT(*) as helpful FROM review_votes WHERE reviewId = ? AND voteType = "helpful"', [reviewId], (err, helpfulResult) => {
    if (!err) {
      db.get('SELECT COUNT(*) as notHelpful FROM review_votes WHERE reviewId = ? AND voteType = "not_helpful"', [reviewId], (err, notHelpfulResult) => {
        if (!err) {
          db.run('UPDATE business_reviews SET helpfulCount = ?, notHelpfulCount = ? WHERE id = ?', 
            [helpfulResult.helpful, notHelpfulResult.notHelpful, reviewId]);
        }
      });
    }
  });
}

// Report a review
app.post('/api/reviews/:reviewId/report', authenticateToken, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { reason, description } = req.body;
    const reporterId = req.user.id;

    if (!reason) {
      return res.status(400).json({ error: 'Reason is required' });
    }

    const validReasons = ['spam', 'inappropriate', 'fake', 'offensive', 'other'];
    if (!validReasons.includes(reason)) {
      return res.status(400).json({ error: 'Invalid reason' });
    }

    // Check if user already reported this review
    db.get('SELECT * FROM review_reports WHERE reviewId = ? AND reporterId = ?', [reviewId, reporterId], (err, existingReport) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (existingReport) {
        return res.status(400).json({ error: 'You have already reported this review' });
      }

      const reportId = uuidv4();
      db.run(`
        INSERT INTO review_reports (id, reviewId, reporterId, reason, description)
        VALUES (?, ?, ?, ?, ?)
      `, [reportId, reviewId, reporterId, reason, description], function(err) {
        if (err) {
          console.error('Error creating report:', err);
          return res.status(500).json({ error: 'Failed to create report' });
        }

        // Update review status to flagged if multiple reports
        db.get('SELECT COUNT(*) as reportCount FROM review_reports WHERE reviewId = ?', [reviewId], (err, result) => {
          if (!err && result.reportCount >= 3) {
            db.run('UPDATE business_reviews SET status = "flagged" WHERE id = ?', [reviewId]);
          }
        });

        res.json({ message: 'Review reported successfully' });
      });
    });
  } catch (error) {
    console.error('Error reporting review:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Business response to review
app.post('/api/reviews/:reviewId/respond', authenticateToken, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { response } = req.body;
    const responderId = req.user.id;

    if (!response || response.trim().length < 10) {
      return res.status(400).json({ error: 'Response must be at least 10 characters long' });
    }

    if (response.length > 500) {
      return res.status(400).json({ error: 'Response cannot exceed 500 characters' });
    }

    // Verify user owns the business that received the review
    db.get(`
      SELECT b.* FROM businesses b
      JOIN business_reviews r ON b.id = r.businessId
      WHERE r.id = ? AND b.ownerId = ?
    `, [reviewId, responderId], (err, business) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!business) {
        return res.status(403).json({ error: 'You can only respond to reviews for your own business' });
      }

      // Check if already responded
      db.get('SELECT * FROM review_responses WHERE reviewId = ? AND responderId = ?', [reviewId, responderId], (err, existingResponse) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        if (existingResponse) {
          return res.status(400).json({ error: 'You have already responded to this review' });
        }

        const responseId = uuidv4();
        db.run(`
          INSERT INTO review_responses (id, reviewId, businessId, responderId, response, status)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [responseId, reviewId, business.id, responderId, response, 'approved'], function(err) {
          if (err) {
            console.error('Error creating response:', err);
            return res.status(500).json({ error: 'Failed to create response' });
          }

          // Create notification for review author
          db.get('SELECT reviewerId FROM business_reviews WHERE id = ?', [reviewId], (err, review) => {
            if (!err && review) {
              createReviewNotification(business.id, review.reviewerId, 'review_response', reviewId);
            }
          });

          res.json({ message: 'Response added successfully' });
        });
      });
    });
  } catch (error) {
    console.error('Error responding to review:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get review notifications
app.get('/api/review-notifications', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0 } = req.query;

    db.all(`
      SELECT * FROM review_notifications
      WHERE userId = ?
      ORDER BY createdAt DESC
      LIMIT ? OFFSET ?
    `, [userId, parseInt(limit), parseInt(offset)], (err, notifications) => {
      if (err) {
        console.error('Error fetching notifications:', err);
        return res.status(500).json({ error: 'Failed to fetch notifications' });
      }

      res.json(notifications);
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark notification as read
app.put('/api/review-notifications/:notificationId/read', authenticateToken, async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    db.run(`
      UPDATE review_notifications 
      SET isRead = 1 
      WHERE id = ? AND userId = ?
    `, [notificationId, userId], function(err) {
      if (err) {
        console.error('Error updating notification:', err);
        return res.status(500).json({ error: 'Failed to update notification' });
      }

      res.json({ message: 'Notification marked as read' });
    });
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== BUSINESS CATEGORIES ENDPOINTS ====================

// Get all business categories
app.get('/api/business-categories', async (req, res) => {
  try {
    db.all(`
      SELECT * FROM business_categories 
      WHERE isActive = 1 
      ORDER BY sortOrder, name
    `, (err, categories) => {
      if (err) {
        console.error('Error fetching business categories:', err);
        return res.status(500).json({ error: 'Failed to fetch business categories' });
      }

      res.json(categories);
    });
  } catch (error) {
    console.error('Error fetching business categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Create business category
app.post('/api/admin/business-categories', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'property-manager') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { name, description, icon, color, sortOrder } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const categoryId = uuidv4();
    db.run(`
      INSERT INTO business_categories (id, name, description, icon, color, sortOrder)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [categoryId, name, description, icon, color || '#3B82F6', sortOrder || 0], function(err) {
      if (err) {
        console.error('Error creating business category:', err);
        return res.status(500).json({ error: 'Failed to create business category' });
      }

      res.json({ 
        message: 'Business category created successfully',
        categoryId: categoryId
      });
    });
  } catch (error) {
    console.error('Error creating business category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Update business category
app.put('/api/admin/business-categories/:categoryId', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'property-manager') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { categoryId } = req.params;
    const { name, description, icon, color, sortOrder, isActive } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    db.run(`
      UPDATE business_categories 
      SET name = ?, description = ?, icon = ?, color = ?, sortOrder = ?, isActive = ?
      WHERE id = ?
    `, [name, description, icon, color, sortOrder, isActive, categoryId], function(err) {
      if (err) {
        console.error('Error updating business category:', err);
        return res.status(500).json({ error: 'Failed to update business category' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Business category not found' });
      }

      res.json({ message: 'Business category updated successfully' });
    });
  } catch (error) {
    console.error('Error updating business category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Delete business category
app.delete('/api/admin/business-categories/:categoryId', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'property-manager') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { categoryId } = req.params;

    // Check if category is being used by any businesses
    db.get('SELECT COUNT(*) as count FROM businesses WHERE categoryId = ?', [categoryId], (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (row.count > 0) {
        return res.status(400).json({ error: 'Cannot delete category that has businesses' });
      }

      db.run('DELETE FROM business_categories WHERE id = ?', [categoryId], function(err) {
        if (err) {
          console.error('Error deleting business category:', err);
          return res.status(500).json({ error: 'Failed to delete business category' });
        }

        if (this.changes === 0) {
          return res.status(404).json({ error: 'Business category not found' });
        }

        res.json({ message: 'Business category deleted successfully' });
      });
    });
  } catch (error) {
    console.error('Error deleting business category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== BUSINESS SEARCH ENDPOINTS ====================

// Search businesses with filters
app.get('/api/businesses/search', async (req, res) => {
  try {
    const { 
      query = '', 
      categoryId = '', 
      minRating = 0, 
      maxDistance = 10, 
      latitude = null, 
      longitude = null,
      openNow = false,
      limit = 20,
      offset = 0
    } = req.query;

    let sql = `
      SELECT b.*, c.name as categoryName, c.icon as categoryIcon, c.color as categoryColor,
             u.name as ownerName,
             (SELECT COUNT(*) FROM business_reviews WHERE businessId = b.id) as reviewCount,
             (SELECT AVG(rating) FROM business_reviews WHERE businessId = b.id) as averageRating
      FROM businesses b
      JOIN business_categories c ON b.categoryId = c.id
      JOIN users u ON b.ownerId = u.id
      WHERE b.status = 'approved'
    `;

    const params = [];

    // Add search filters
    if (query) {
      sql += ` AND (b.name LIKE ? OR b.description LIKE ? OR b.address LIKE ?)`;
      params.push(`%${query}%`, `%${query}%`, `%${query}%`);
    }

    if (categoryId) {
      sql += ` AND b.categoryId = ?`;
      params.push(categoryId);
    }

    if (minRating > 0) {
      sql += ` AND (SELECT AVG(rating) FROM business_reviews WHERE businessId = b.id) >= ?`;
      params.push(minRating);
    }

    // Add distance filter if coordinates provided
    if (latitude && longitude && maxDistance > 0) {
      sql += ` AND (
        6371 * acos(
          cos(radians(?)) * cos(radians(b.latitude)) * 
          cos(radians(b.longitude) - radians(?)) + 
          sin(radians(?)) * sin(radians(b.latitude))
        )
      ) <= ?`;
      params.push(latitude, longitude, latitude, maxDistance);
    }

    // Add sorting and pagination
    sql += ` ORDER BY b.name LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    db.all(sql, params, (err, businesses) => {
      if (err) {
        console.error('Error searching businesses:', err);
        return res.status(500).json({ error: 'Failed to search businesses' });
      }

      // Calculate distances if coordinates provided
      if (latitude && longitude) {
        businesses.forEach(business => {
          if (business.latitude && business.longitude) {
            business.distance = calculateDistance(
              parseFloat(latitude), 
              parseFloat(longitude), 
              business.latitude, 
              business.longitude
            );
          }
        });

        // Sort by distance if coordinates provided
        businesses.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
      }

      res.json(businesses);
    });
  } catch (error) {
    console.error('Error searching businesses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get businesses by category
app.get('/api/businesses/category/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    db.all(`
      SELECT b.*, c.name as categoryName, c.icon as categoryIcon, c.color as categoryColor,
             u.name as ownerName,
             (SELECT COUNT(*) FROM business_reviews WHERE businessId = b.id) as reviewCount,
             (SELECT AVG(rating) FROM business_reviews WHERE businessId = b.id) as averageRating
      FROM businesses b
      JOIN business_categories c ON b.categoryId = c.id
      JOIN users u ON b.ownerId = u.id
      WHERE b.status = 'approved' AND b.categoryId = ?
      ORDER BY b.name
      LIMIT ? OFFSET ?
    `, [categoryId, parseInt(limit), parseInt(offset)], (err, businesses) => {
      if (err) {
        console.error('Error fetching businesses by category:', err);
        return res.status(500).json({ error: 'Failed to fetch businesses' });
      }

      res.json(businesses);
    });
  } catch (error) {
    console.error('Error fetching businesses by category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get nearby businesses
app.get('/api/businesses/nearby', async (req, res) => {
  try {
    const { latitude, longitude, radius = 5, limit = 20 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    db.all(`
      SELECT b.*, c.name as categoryName, c.icon as categoryIcon, c.color as categoryColor,
             u.name as ownerName,
             (SELECT COUNT(*) FROM business_reviews WHERE businessId = b.id) as reviewCount,
             (SELECT AVG(rating) FROM business_reviews WHERE businessId = b.id) as averageRating,
             (6371 * acos(
               cos(radians(?)) * cos(radians(b.latitude)) * 
               cos(radians(b.longitude) - radians(?)) + 
               sin(radians(?)) * sin(radians(b.latitude))
             )) as distance
      FROM businesses b
      JOIN business_categories c ON b.categoryId = c.id
      JOIN users u ON b.ownerId = u.id
      WHERE b.status = 'approved' 
        AND b.latitude IS NOT NULL 
        AND b.longitude IS NOT NULL
        AND (6371 * acos(
          cos(radians(?)) * cos(radians(b.latitude)) * 
          cos(radians(b.longitude) - radians(?)) + 
          sin(radians(?)) * sin(radians(b.latitude))
        )) <= ?
      ORDER BY distance
      LIMIT ?
    `, [latitude, longitude, latitude, latitude, longitude, latitude, radius, parseInt(limit)], (err, businesses) => {
      if (err) {
        console.error('Error fetching nearby businesses:', err);
        return res.status(500).json({ error: 'Failed to fetch nearby businesses' });
      }

      res.json(businesses);
    });
  } catch (error) {
    console.error('Error fetching nearby businesses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

// ==================== ADMIN REVIEW MODERATION ENDPOINTS ====================

// Get all reviews for admin moderation
app.get('/api/admin/reviews', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'property-manager') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { status, sort = 'newest', search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT br.*, 
             u.name as reviewerName, u.email as reviewerEmail, u.apartment as reviewerApartment,
             b.name as businessName, b.address as businessAddress,
             COUNT(rv.id) as voteCount,
             COUNT(rr.id) as reportCount
      FROM business_reviews br
      LEFT JOIN users u ON br.reviewerId = u.id
      LEFT JOIN businesses b ON br.businessId = b.id
      LEFT JOIN review_votes rv ON br.id = rv.reviewId
      LEFT JOIN review_reports rr ON br.id = rr.reviewId
    `;
    
    const whereConditions = [];
    const params = [];
    
    if (status && status !== 'all') {
      whereConditions.push('br.status = ?');
      params.push(status);
    }
    
    if (search) {
      whereConditions.push('(br.comment LIKE ? OR u.name LIKE ? OR b.name LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    if (whereConditions.length > 0) {
      query += ' WHERE ' + whereConditions.join(' AND ');
    }
    
    query += ' GROUP BY br.id';
    
    // Add sorting
    switch (sort) {
      case 'spam':
        query += ' ORDER BY br.spamScore DESC';
        break;
      case 'reports':
        query += ' ORDER BY reportCount DESC';
        break;
      default:
        query += ' ORDER BY br.createdAt DESC';
    }
    
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);
    
    db.all(query, params, (err, reviews) => {
      if (err) {
        console.error('Error fetching admin reviews:', err);
        return res.status(500).json({ error: 'Failed to fetch reviews' });
      }
      
      // Fetch photos and responses for each review
      const reviewsWithDetails = reviews.map(review => {
        return new Promise((resolve) => {
          db.all('SELECT * FROM review_photos WHERE reviewId = ?', [review.id], (err, photos) => {
            if (err) {
              console.error('Error fetching review photos:', err);
              resolve({ ...review, photos: [] });
              return;
            }
            
            db.all('SELECT * FROM review_responses WHERE reviewId = ?', [review.id], (err, responses) => {
              if (err) {
                console.error('Error fetching review responses:', err);
                resolve({ ...review, photos, responses: [] });
                return;
              }
              
              db.all('SELECT * FROM review_reports WHERE reviewId = ?', [review.id], (err, reports) => {
                if (err) {
                  console.error('Error fetching review reports:', err);
                  resolve({ ...review, photos, responses, reports: [] });
                  return;
                }
                
                resolve({ ...review, photos, responses, reports });
              });
            });
          });
        });
      });
      
      Promise.all(reviewsWithDetails).then(reviewsWithData => {
        res.json(reviewsWithData);
      });
    });
  } catch (error) {
    console.error('Error in admin reviews endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Moderate a review (approve, reject, flag)
app.post('/api/admin/reviews/:reviewId/moderate', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'property-manager') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { reviewId } = req.params;
    const { action, reason } = req.body;
    
    if (!['approve', 'reject', 'flag'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }
    
    let status;
    switch (action) {
      case 'approve':
        status = 'approved';
        break;
      case 'reject':
        status = 'rejected';
        break;
      case 'flag':
        status = 'flagged';
        break;
    }
    
    db.run(`
      UPDATE business_reviews 
      SET status = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [status, reviewId], function(err) {
      if (err) {
        console.error('Error moderating review:', err);
        return res.status(500).json({ error: 'Failed to moderate review' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Review not found' });
      }
      
      // Create notification for business owner
      db.get('SELECT businessId FROM business_reviews WHERE id = ?', [reviewId], (err, review) => {
        if (err) {
          console.error('Error getting review business:', err);
        } else if (review) {
          const notificationType = action === 'approve' ? 'review_approved' : 
                                 action === 'reject' ? 'review_rejected' : 'review_report';
          const title = action === 'approve' ? 'Review Approved' : 
                       action === 'reject' ? 'Review Rejected' : 'Review Flagged';
          const message = action === 'approve' ? 'Your review has been approved and is now visible.' :
                         action === 'reject' ? 'Your review has been rejected and will not be displayed.' :
                         'Your review has been flagged for review by our team.';
          
          createReviewNotification(review.businessId, reviewId, notificationType, title, message);
        }
      });
      
      res.json({ message: 'Review moderated successfully' });
    });
  } catch (error) {
    console.error('Error in moderate review endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== BUSINESS OWNER REVIEW MANAGEMENT ENDPOINTS ====================

// Get reviews for business owner
app.get('/api/business/reviews', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'business-owner') {
      return res.status(403).json({ error: 'Business owner access required' });
    }

    const { status, sort = 'newest', page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    // Get business owned by user
    db.get('SELECT id FROM businesses WHERE ownerId = ?', [req.user.id], (err, business) => {
      if (err) {
        console.error('Error getting business:', err);
        return res.status(500).json({ error: 'Failed to get business' });
      }
      
      if (!business) {
        return res.status(404).json({ error: 'Business not found' });
      }
      
      let query = `
        SELECT br.*, 
               u.name as reviewerName, u.apartment as reviewerApartment,
               COUNT(rv.id) as voteCount,
               COUNT(rr.id) as reportCount
        FROM business_reviews br
        LEFT JOIN users u ON br.reviewerId = u.id
        LEFT JOIN review_votes rv ON br.id = rv.reviewId
        LEFT JOIN review_reports rr ON br.id = rr.reviewId
        WHERE br.businessId = ?
      `;
      
      const params = [business.id];
      
      if (status && status !== 'all') {
        query += ' AND br.status = ?';
        params.push(status);
      }
      
      query += ' GROUP BY br.id';
      
      // Add sorting
      switch (sort) {
        case 'rating':
          query += ' ORDER BY br.rating DESC';
          break;
        case 'helpful':
          query += ' ORDER BY br.helpfulCount DESC';
          break;
        default:
          query += ' ORDER BY br.createdAt DESC';
      }
      
      query += ' LIMIT ? OFFSET ?';
      params.push(parseInt(limit), offset);
      
      db.all(query, params, (err, reviews) => {
        if (err) {
          console.error('Error fetching business reviews:', err);
          return res.status(500).json({ error: 'Failed to fetch reviews' });
        }
        
        // Fetch photos and responses for each review
        const reviewsWithDetails = reviews.map(review => {
          return new Promise((resolve) => {
            db.all('SELECT * FROM review_photos WHERE reviewId = ?', [review.id], (err, photos) => {
              if (err) {
                console.error('Error fetching review photos:', err);
                resolve({ ...review, photos: [] });
                return;
              }
              
              db.all('SELECT * FROM review_responses WHERE reviewId = ?', [review.id], (err, responses) => {
                if (err) {
                  console.error('Error fetching review responses:', err);
                  resolve({ ...review, photos, responses: [] });
                  return;
                }
                
                resolve({ ...review, photos, responses });
              });
            });
          });
        });
        
        Promise.all(reviewsWithDetails).then(reviewsWithData => {
          res.json(reviewsWithData);
        });
      });
    });
  } catch (error) {
    console.error('Error in business reviews endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get business analytics
app.get('/api/business/analytics', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'business-owner') {
      return res.status(403).json({ error: 'Business owner access required' });
    }

    // Get business owned by user
    db.get('SELECT id FROM businesses WHERE ownerId = ?', [req.user.id], (err, business) => {
      if (err) {
        console.error('Error getting business:', err);
        return res.status(500).json({ error: 'Failed to get business' });
      }
      
      if (!business) {
        return res.status(404).json({ error: 'Business not found' });
      }
      
      // Get review analytics
      db.get(`
        SELECT 
          COUNT(*) as totalReviews,
          AVG(rating) as averageRating,
          COUNT(CASE WHEN status = 'approved' THEN 1 END) as approvedReviews,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pendingReviews,
          COUNT(CASE WHEN status = 'flagged' THEN 1 END) as flaggedReviews
        FROM business_reviews 
        WHERE businessId = ?
      `, [business.id], (err, reviewStats) => {
        if (err) {
          console.error('Error getting review stats:', err);
          return res.status(500).json({ error: 'Failed to get review stats' });
        }
        
        // Get view count (simulated)
        const totalViews = Math.floor(Math.random() * 1000) + 100;
        
        res.json({
          summary: {
            totalReviews: reviewStats.totalReviews || 0,
            averageRating: reviewStats.averageRating || 0,
            approvedReviews: reviewStats.approvedReviews || 0,
            pendingReviews: reviewStats.pendingReviews || 0,
            flaggedReviews: reviewStats.flaggedReviews || 0,
            totalViews: totalViews
          }
        });
      });
    });
  } catch (error) {
    console.error('Error in business analytics endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get review notifications for business owner
app.get('/api/business/review-notifications', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'business-owner') {
      return res.status(403).json({ error: 'Business owner access required' });
    }

    const { page = 1, limit = 20, isRead } = req.query;
    const offset = (page - 1) * limit;
    
    // Get business owned by user
    db.get('SELECT id FROM businesses WHERE ownerId = ?', [req.user.id], (err, business) => {
      if (err) {
        console.error('Error getting business:', err);
        return res.status(500).json({ error: 'Failed to get business' });
      }
      
      if (!business) {
        return res.status(404).json({ error: 'Business not found' });
      }
      
      let query = `
        SELECT rn.*, u.name as userName
        FROM review_notifications rn
        LEFT JOIN users u ON rn.userId = u.id
        WHERE rn.businessId = ?
      `;
      
      const params = [business.id];
      
      if (isRead !== undefined) {
        query += ' AND rn.isRead = ?';
        params.push(isRead === 'true' ? 1 : 0);
      }
      
      query += ' ORDER BY rn.createdAt DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit), offset);
      
      db.all(query, params, (err, notifications) => {
        if (err) {
          console.error('Error fetching business review notifications:', err);
          return res.status(500).json({ error: 'Failed to fetch notifications' });
        }
        res.json(notifications);
      });
    });
  } catch (error) {
    console.error('Error in business review notifications endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
