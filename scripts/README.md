# Data Generation Scripts

This directory contains scripts to generate sample data for the BA Property Manager application.

## Scripts

### 1. Quick Data Generator (`quickData.js`)
Generates a minimal dataset for quick testing and development.

**Usage:**
```bash
npm run quick-data
```

**Generates:**
- 2 buildings
- 2 admin users
- 4 tenant users
- 3 maintenance requests
- 3 community posts
- 8 payments

**Login Credentials:**
- Admin: `admin1@example.com` / `admin123`
- Tenant: `maria@example.com` / `tenant123`

### 2. Full Data Generator (`generateSampleData.js`)
Generates a comprehensive dataset with realistic Buenos Aires property management data.

**Usage:**
```bash
npm run generate-data
```

**Generates:**
- 10 buildings across different Buenos Aires neighborhoods
- 10 admin users (one per building)
- 20 tenant users (distributed across buildings)
- 50 maintenance requests
- 80 community posts
- 120 payments
- 30 invitations

**Login Credentials:**
- Admin users: `admin1@example.com` through `admin10@example.com` / `admin123`
- Tenant users: Various email addresses / `tenant123`

## Data Features

### Buildings
- Realistic Buenos Aires addresses
- Different neighborhoods (Palermo, Recoleta, Belgrano, etc.)
- Varied apartment counts (8-28 units)
- Descriptive building information

### Users
- Admin users for each building
- Tenant users with realistic Spanish names
- Proper apartment assignments
- Hashed passwords for security

### Maintenance Requests
- Common building maintenance issues
- Various statuses (pending, in-progress, completed)
- Different priority levels
- Realistic cost estimates

### Community Posts
- Different post types (question, announcement, appreciation, etc.)
- Realistic community interactions
- Varied engagement metrics (likes, comments)

### Payments
- Different payment types (rent, deposit, expense)
- Various payment methods
- Realistic amounts in Argentine pesos
- Different payment statuses

### Invitations
- Pending tenant invitations
- Realistic apartment assignments
- Expiration dates
- Invitation tokens

## Usage Notes

1. **Clear Existing Data**: Both scripts clear existing data before generating new data
2. **Database Location**: Scripts use the SQLite database at `./server/database.sqlite`
3. **Server Restart**: After running scripts, restart the server to see new data
4. **Development**: Use `quick-data` for development, `generate-data` for demos

## Customization

You can modify the data arrays in each script to:
- Add more buildings or users
- Change addresses or descriptions
- Modify maintenance request types
- Add new community post content
- Adjust payment amounts or types

## Troubleshooting

If you encounter errors:
1. Make sure the server is not running
2. Check that the database file exists
3. Verify all dependencies are installed
4. Ensure you have write permissions to the database file
