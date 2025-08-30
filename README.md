# BA Property Manager - Complete System Documentation

## 🏗️ System Overview

BA Property Manager is a comprehensive property management application built with React, Vite, and Supabase. The system manages buildings, tenants, maintenance requests, payments, and community features.

## 🗄️ Database Schema

### Core Tables

#### 1. `profiles` (extends Supabase auth.users)
```sql
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  apartment TEXT,
  user_type TEXT DEFAULT 'tenant' CHECK(user_type IN ('tenant', 'property-manager', 'building-owner', 'business-owner')),
  building_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 2. `buildings`
```sql
CREATE TABLE public.buildings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  description TEXT,
  security_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 3. `maintenance_requests`
```sql
CREATE TABLE public.maintenance_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  requester_id UUID REFERENCES public.profiles(id),
  building_id UUID REFERENCES public.buildings(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  assigned_to UUID REFERENCES public.profiles(id),
  estimated_cost REAL,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 4. `payments`
```sql
CREATE TABLE public.payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tenant_id UUID REFERENCES public.profiles(id),
  building_id UUID REFERENCES public.buildings(id),
  apartment TEXT NOT NULL,
  amount REAL NOT NULL,
  payment_type TEXT DEFAULT 'rent' CHECK(payment_type IN ('rent', 'utilities', 'maintenance', 'other')),
  due_date DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'paid', 'overdue', 'cancelled')),
  payment_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 5. `invitations`
```sql
CREATE TABLE public.invitations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  inviter_id UUID REFERENCES public.profiles(id),
  building_id UUID REFERENCES public.buildings(id),
  email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'expired')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 6. `groups`
```sql
CREATE TABLE public.groups (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  building_id UUID REFERENCES public.buildings(id),
  created_by UUID REFERENCES public.profiles(id),
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 7. `group_members`
```sql
CREATE TABLE public.group_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK(role IN ('member', 'moderator', 'admin')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);
```

#### 8. `business_categories`
```sql
CREATE TABLE public.business_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT DEFAULT '#3B82F6',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 9. `businesses`
```sql
CREATE TABLE public.businesses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category_id UUID REFERENCES public.business_categories(id),
  description TEXT,
  address TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  website TEXT,
  hours TEXT,
  latitude REAL,
  longitude REAL,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 10. `community_posts`
```sql
CREATE TABLE public.community_posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  author_id UUID REFERENCES public.profiles(id),
  building_id UUID REFERENCES public.buildings(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  post_type TEXT DEFAULT 'general' CHECK(post_type IN ('general', 'announcement', 'event', 'question')),
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔐 Authentication & Authorization

### User Types
- **tenant**: Regular tenant with access to their own data
- **property-manager**: Building manager with access to building data
- **building-owner**: Building owner with full access
- **business-owner**: Business owner with business-specific access

### RLS Policies
All tables have Row Level Security (RLS) enabled with policies that:
- Allow authenticated users to read data they have access to
- Allow users to create/update their own data
- Restrict access based on user type and building association

## 🏗️ Frontend Architecture

### Tech Stack
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context + Hooks
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Language**: Internationalization support (English/Spanish)

### Project Structure
```
src/
├── components/           # React components
├── contexts/            # React contexts
├── hooks/               # Custom React hooks
├── services/            # API services
├── lib/                 # Library configurations
└── utils/               # Utility functions
```

## 🧩 Core Components

### 1. Authentication Components
- **Auth.jsx**: Login/Register form
- **LanguageToggle.jsx**: Language switcher

### 2. Dashboard Components
- **AdminDashboard.jsx**: Property manager/owner dashboard
- **BusinessDashboard.jsx**: Business owner dashboard  
- **TenantDashboard.jsx**: Tenant dashboard

### 3. Management Components
- **MaintenanceRequestForm.jsx**: Create/edit maintenance requests
- **MaintenanceRequestDetail.jsx**: View maintenance request details
- **PaymentForm.jsx**: Payment management
- **BusinessProfile.jsx**: Business profile management
- **BusinessSearch.jsx**: Business search functionality

### 4. Community Components
- **Community.jsx**: Community features
- **CommunityCreation.jsx**: Create community groups
- **ReviewForm.jsx**: Business review system
- **ReviewManagement.jsx**: Review moderation

### 5. Utility Components
- **ErrorBoundary.jsx**: Error handling
- **DataFetchTest.jsx**: Data fetching testing
- **TestUserCreator.jsx**: User creation for testing

## 🔄 Data Flow Architecture

### 1. Authentication Flow
```
User Input → Auth Component → Supabase Auth → SupabaseContext → User State
```

### 2. Data Fetching Flow
```
Component → useDataFetch Hook → Supabase API → State Update → UI Render
```

### 3. Dashboard Data Flow
```
useDashboardData Hook → Multiple useDataFetch Hooks → Data Transformation → Dashboard State
```

## 🎯 Key Features

### 1. Property Management
- Building information management
- Tenant management and profiles
- Maintenance request tracking
- Payment processing and tracking

### 2. Community Features
- Building-specific community groups
- Announcements and events
- Member management
- Post creation and sharing

### 3. Business Directory
- Business registration and profiles
- Category-based organization
- Review and rating system
- Business verification system

### 4. User Management
- Multi-role user system
- Profile management
- Invitation system
- Access control

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account and project

### Installation
```bash
# Clone repository
git clone <repository-url>
cd ba-property-manager

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start development server
npm run dev
```

### Environment Variables
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Setup
1. Create Supabase project
2. Run schema creation scripts from `archive/` folder
3. Set up RLS policies
4. Create test data using provided scripts

## 🧪 Testing & Development

### Test Data
- **Sample Users**: Various user types for testing
- **Sample Buildings**: Multiple building configurations
- **Sample Data**: Maintenance requests, payments, businesses
- **Community Data**: Groups, posts, members

### Development Tools
- **Data Fetch Testing**: Built-in testing components
- **Debug Information**: Comprehensive logging and debugging
- **Error Boundaries**: Graceful error handling

## 🔧 Common Issues & Solutions

### 1. RLS Policy Issues
- Ensure RLS is properly configured
- Check user authentication status
- Verify user type and building associations

### 2. Data Fetching Problems
- Check authentication state
- Verify table names and field mappings
- Ensure proper error handling

### 3. Component Rendering Issues
- Verify React hooks rules compliance
- Check component prop passing
- Ensure proper state management

## 📋 Development Checklist

### Phase 1: Core Setup
- [ ] Project structure setup
- [ ] Supabase configuration
- [ ] Basic authentication
- [ ] Database schema creation

### Phase 2: Basic Features
- [ ] User authentication flow
- [ ] Basic dashboard structure
- [ ] User profile management
- [ ] Building information display

### Phase 3: Management Features
- [ ] Maintenance request system
- [ ] Payment management
- [ ] Tenant management
- [ ] Building management

### Phase 4: Community Features
- [ ] Community groups
- [ ] Posting system
- [ ] Member management
- [ ] Business directory

### Phase 5: Advanced Features
- [ ] Review system
- [ ] Business verification
- [ ] Advanced reporting
- [ ] Mobile optimization

## 🎨 UI/UX Guidelines

### Design System
- **Colors**: Consistent color palette with Tailwind CSS
- **Typography**: Clear hierarchy and readability
- **Spacing**: Consistent spacing using Tailwind utilities
- **Components**: Reusable component library

### Responsive Design
- Mobile-first approach
- Breakpoint-based layouts
- Touch-friendly interactions
- Accessible design patterns

## 🔒 Security Considerations

### Data Protection
- RLS policies for data access control
- User authentication and authorization
- Input validation and sanitization
- Secure API endpoints

### Privacy
- User data protection
- GDPR compliance considerations
- Data retention policies
- User consent management

## 📚 Additional Resources

### Documentation
- Supabase documentation
- React documentation
- Tailwind CSS documentation
- Vite documentation

### Testing
- Component testing strategies
- Integration testing approaches
- End-to-end testing setup
- Performance testing

This documentation provides a complete foundation for rebuilding the BA Property Manager system from scratch with a clean, maintainable architecture.
