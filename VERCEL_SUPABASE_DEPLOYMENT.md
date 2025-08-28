# 🚀 Vercel + Supabase Deployment Guide

## **Overview**
This guide will help you deploy your BA Property Manager app using:
- **Frontend**: Vercel (React app)
- **Backend**: Supabase (Database + Auth + API)

## **📋 Prerequisites**
- GitHub account with your code
- Vercel account (vercel.com)
- Supabase account (supabase.com)

---

## **🔧 Step 1: Set Up Supabase Project**

### **1.1 Create Supabase Project**
1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `ba-property-manager`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait for setup to complete (2-3 minutes)

### **1.2 Get Your Credentials**
1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://xyz.supabase.co`)
   - **Anon public key** (starts with `eyJ...`)

### **1.3 Set Up Database Schema**
1. Go to **SQL Editor**
2. Copy the entire content of `supabase-schema.sql`
3. Paste and run the SQL
4. Verify all tables are created in **Table Editor**

### **1.4 Configure Authentication**
1. Go to **Authentication** → **Settings**
2. Under **Site URL**, add your Vercel domain (we'll get this later)
3. Under **Redirect URLs**, add:
   ```
   https://your-app.vercel.app/auth/callback
   http://localhost:3000/auth/callback
   ```

---

## **🌐 Step 2: Deploy Frontend to Vercel**

### **2.1 Prepare Your Code**
1. Update `.env.local` with your Supabase credentials:
   ```bash
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

2. Create `.env.production`:
   ```bash
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. Commit and push your changes:
   ```bash
   git add .
   git commit -m "Add Supabase integration"
   git push origin main
   ```

### **2.2 Deploy to Vercel**
1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "New Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (leave default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Click "Deploy"
6. Wait for deployment to complete

### **2.3 Set Environment Variables in Vercel**
1. Go to your project dashboard
2. Click **Settings** → **Environment Variables**
3. Add these variables:
   - `VITE_SUPABASE_URL`: `https://your-project-id.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `your-anon-key-here`
4. Click "Save"
5. Redeploy your project

---

## **🔐 Step 3: Configure Supabase Security**

### **3.1 Update Site URL**
1. Go back to Supabase dashboard
2. **Authentication** → **Settings**
3. Update **Site URL** to your Vercel domain
4. Add your Vercel domain to **Redirect URLs**

### **3.2 Test Authentication**
1. Go to your Vercel app
2. Try to sign up/sign in
3. Check Supabase **Authentication** → **Users** for new users

---

## **📱 Step 4: Test Your App**

### **4.1 Test Core Features**
- ✅ User registration and login
- ✅ Profile management
- ✅ Building joining
- ✅ Business registration
- ✅ Review system

### **4.2 Check Database**
1. Go to Supabase **Table Editor**
2. Verify data is being created
3. Check **Authentication** → **Users**

---

## **🚀 Step 5: Production Setup**

### **5.1 Custom Domain (Optional)**
1. In Vercel, go to **Settings** → **Domains**
2. Add your custom domain
3. Update Supabase redirect URLs
4. Update environment variables

### **5.2 Monitoring**
1. **Vercel Analytics**: Built-in performance monitoring
2. **Supabase Dashboard**: Database and auth monitoring
3. **Error Tracking**: Consider adding Sentry

---

## **🔧 Troubleshooting**

### **Common Issues**

#### **"Invalid API key" Error**
- Verify your Supabase credentials in Vercel environment variables
- Check that you're using the **anon key**, not the service role key

#### **CORS Errors**
- Ensure your Vercel domain is in Supabase **Site URL** and **Redirect URLs**
- Check that environment variables are set correctly

#### **Authentication Not Working**
- Verify Supabase auth settings
- Check browser console for errors
- Ensure redirect URLs are correct

#### **Database Connection Issues**
- Verify Supabase project is active
- Check database password and connection string
- Ensure schema was created successfully

### **Debug Steps**
1. Check browser console for errors
2. Verify environment variables in Vercel
3. Check Supabase logs in dashboard
4. Test locally with `.env.local`

---

## **📚 Next Steps**

### **Immediate**
- ✅ Test all features work in production
- ✅ Set up monitoring and error tracking
- ✅ Configure backup and recovery

### **Future Enhancements**
- 🔄 Real-time features using Supabase subscriptions
- 🔄 File uploads to Supabase Storage
- 🔄 Advanced analytics and reporting
- 🔄 Mobile app using React Native

---

## **🎉 You're Done!**

Your BA Property Manager app is now running on:
- **Frontend**: Vercel (with global CDN)
- **Backend**: Supabase (with PostgreSQL + Auth)
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (ready for file uploads)

### **Benefits of This Setup**
- ✅ **Everything on Vercel**: One platform for frontend
- ✅ **Scalable Database**: PostgreSQL instead of SQLite
- ✅ **Built-in Auth**: No need to manage JWT tokens
- ✅ **Real-time Ready**: Supabase subscriptions
- ✅ **Global Performance**: Vercel edge network
- ✅ **Easy Maintenance**: Managed services

### **Support**
- **Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **Supabase**: [supabase.com/docs](https://supabase.com/docs)
- **Community**: [github.com/supabase/supabase](https://github.com/supabase/supabase)

---

**Happy coding! 🚀**
