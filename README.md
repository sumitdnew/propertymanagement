# 🏢 BA Property Manager

A comprehensive property management application built with React, Supabase, and Vercel.

## ✨ Features

- **🔐 Authentication**: Secure user management with Supabase Auth
- **🏢 Building Management**: Join buildings and manage properties
- **💼 Business Directory**: Business registration and management system
- **⭐ Review System**: 5-star ratings with photo support and moderation
- **🔍 Search & Discovery**: Find businesses by category, location, and rating
- **📱 Responsive Design**: Works on all devices with Tailwind CSS
- **🌍 Multi-language**: English and Spanish support
- **📊 Analytics**: Comprehensive reporting and business insights

## 🚀 Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + API)
- **Hosting**: Vercel
- **State Management**: React Context + Supabase Client

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App     │    │    Supabase     │    │     Vercel      │
│   (Frontend)    │◄──►│   (Backend)     │    │   (Hosting)     │
│                 │    │                 │    │                 │
│ • Components    │    │ • PostgreSQL    │    │ • Global CDN    │
│ • State Mgmt    │    │ • Auth System   │    │ • Auto Deploy   │
│ • UI/UX        │    │ • Real-time API │    │ • Analytics     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- Vercel account

### 1. Clone & Install
```bash
git clone https://github.com/yourusername/ba-property-manager.git
cd ba-property-manager
npm install
```

### 2. Set Up Supabase
1. Create a project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key
3. Run the schema from `supabase-schema.sql`

### 3. Configure Environment
```bash
# .env.local
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run Development Server
```bash
npm run dev
```

### 5. Deploy to Vercel
```bash
npm run build
# Then deploy to Vercel with the build output
```

## 📚 Documentation

- **[Deployment Guide](VERCEL_SUPABASE_DEPLOYMENT.md)**: Complete setup instructions
- **[API Reference](src/services/supabaseApi.js)**: Supabase API methods
- **[Database Schema](supabase-schema.sql)**: Complete database structure

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Project Structure
```
src/
├── components/          # React components
├── contexts/           # React contexts (Auth, Language)
├── services/           # API services
├── lib/               # Utility libraries
└── App.jsx            # Main application
```

## 🌟 Key Benefits

- **🚀 Modern Stack**: Built with latest React and Supabase
- **🔒 Secure**: Row-level security and built-in authentication
- **📱 Responsive**: Mobile-first design with Tailwind CSS
- **🌍 Scalable**: PostgreSQL database with real-time capabilities
- **💰 Cost-effective**: Free tiers for both Vercel and Supabase
- **🔧 Easy Maintenance**: Managed services, no server management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

- **Documentation**: Check the deployment guide and code comments
- **Issues**: Create an issue on GitHub
- **Community**: Join our discussions

---

**Built with ❤️ using React, Supabase, and Vercel**
