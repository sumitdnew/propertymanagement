# BA Property Manager

A comprehensive property management application for Buenos Aires buildings with real-time database integration, maintenance tracking, tenant management, and community features.

## Features

### 🏢 **Property Management**
- Dashboard with real-time metrics and analytics
- Maintenance request tracking with priority levels
- Tenant management and communication
- Payment tracking and financial reporting
- Building invitation system

### 🌐 **Multi-language Support**
- English and Spanish interface
- Easy language switching
- Extensible for additional languages

### 🔐 **Authentication & Security**
- JWT-based authentication
- Role-based access control (Tenant, Property Manager, Building Owner)
- Secure password hashing with bcrypt
- Token-based session management

### 📊 **Database Integration**
- SQLite database with full CRUD operations
- Real-time data synchronization
- Sample data included for testing
- RESTful API endpoints

## Tech Stack

### Frontend
- **React 18** with modern hooks
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Context API** for state management

### Backend
- **Node.js** with Express
- **SQLite** database
- **JWT** for authentication
- **bcryptjs** for password hashing
- **CORS** enabled for cross-origin requests

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ba-property-manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Generate sample data (optional)**
   ```bash
   # For quick testing
   npm run quick-data
   
   # For comprehensive demo data
   npm run generate-data
   ```

4. **Start the development servers**
   ```bash
   # Start both frontend and backend
   npm run dev:full
   
   # Or start them separately:
   npm run server  # Backend on port 5000
   npm run dev     # Frontend on port 3000
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

6. **Login with sample credentials**
   - Admin: `admin1@example.com` / `admin123`
   - Tenant: `maria@example.com` / `tenant123`

## Database Schema

### Tables
- **users** - User accounts and profiles
- **buildings** - Building information
- **maintenance_requests** - Maintenance tracking
- **community_posts** - Community communication
- **payments** - Financial transactions
- **invitations** - Tenant invitation system

### Sample Data
The application includes sample data for testing:
- **Admin User**: admin@example.com / admin123
- **Tenant 1**: maria@example.com / tenant123
- **Tenant 2**: carlos@example.com / tenant123

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Dashboard
- `GET /api/dashboard/metrics` - Dashboard metrics

### Maintenance
- `GET /api/maintenance-requests` - Get all requests
- `POST /api/maintenance-requests` - Create new request
- `PUT /api/maintenance-requests/:id` - Update request
- `DELETE /api/maintenance-requests/:id` - Delete request

### Community
- `GET /api/community-posts` - Get all posts
- `POST /api/community-posts` - Create new post

### Tenants
- `GET /api/tenants` - Get all tenants
- `POST /api/tenants` - Create new tenant
- `PUT /api/tenants/:id` - Update tenant

### Payments
- `GET /api/payments` - Get all payments
- `POST /api/payments` - Create new payment

### Invitations
- `GET /api/invitations` - Get all invitations
- `POST /api/invitations` - Create new invitation
- `POST /api/invitations/:id/resend` - Resend invitation
- `DELETE /api/invitations/:id` - Cancel invitation

### User Profile
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

## Usage

### For Property Managers
1. **Login** with admin credentials
2. **Dashboard** - View building metrics and recent activity
3. **Maintenance** - Track and manage maintenance requests
4. **Tenants** - Manage tenant information and communications
5. **Payments** - Track rent payments and financial data
6. **Invitations** - Send invitations to new tenants

### For Tenants
1. **Login** with tenant credentials
2. **Dashboard** - View personal information and recent activity
3. **Maintenance** - Submit and track maintenance requests
4. **Community** - Participate in building community discussions
5. **Payments** - View payment history and status

## Development

### Project Structure
```
ba-property-manager/
├── src/
│   ├── components/          # React components
│   ├── contexts/           # React contexts
│   ├── services/           # API services
│   └── assets/             # Static assets
├── server/
│   └── index.js            # Express server
├── database.sqlite         # SQLite database
└── package.json
```

### Adding New Features
1. **Backend**: Add new routes in `server/index.js`
2. **Frontend**: Create new components in `src/components/`
3. **API**: Add new methods in `src/services/api.js`
4. **Database**: Add new tables in the database initialization

### Adding New Languages
1. Add translation keys to `src/contexts/LanguageContext.jsx`
2. Update components to use `t()` function
3. Test language switching functionality

## Environment Variables

Create a `.env` file in the root directory:
```env
JWT_SECRET=your-secret-key-here
PORT=3001
```

## Production Deployment

### Build the Application
```bash
npm run build
```

### Database Setup
- The SQLite database is created automatically on first run
- For production, consider using PostgreSQL or MySQL
- Set up proper database backups

### Security Considerations
- Change default JWT secret
- Set up HTTPS in production
- Implement rate limiting
- Add input validation and sanitization
- Set up proper CORS configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.
