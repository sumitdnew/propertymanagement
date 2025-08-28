# Deployment Guide for Render

## Backend Deployment on Render

### 1. Prerequisites
- GitHub account with your code
- Render account (free at render.com)

### 2. Prepare Your Code
- Ensure all changes are committed to GitHub
- Verify `package.json` has a `start` script
- Check that `render.yaml` is in your root directory

### 3. Deploy to Render

#### Option A: Using render.yaml (Recommended)
1. Go to [render.com](https://render.com) and sign up/login
2. Click "New +" → "Blueprint"
3. Connect your GitHub repository
4. Render will automatically detect `render.yaml` and deploy
5. Wait for deployment to complete

#### Option B: Manual Deployment
1. Go to [render.com](https://render.com) and sign up/login
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `ba-property-manager-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

### 4. Environment Variables
Set these in Render dashboard:
- `NODE_ENV`: `production`
- `JWT_SECRET`: Generate a secure random string
- `PORT`: `10000` (Render will override this)

### 5. Get Your Backend URL
After deployment, you'll get a URL like:
`https://your-app-name.onrender.com`

### 6. Update Frontend
Update your frontend environment variables:
```bash
# .env.production
REACT_APP_API_URL=https://your-app-name.onrender.com/api
```

### 7. Deploy Frontend to Vercel
1. Push your updated code to GitHub
2. Deploy to Vercel (it will auto-detect changes)
3. Set environment variables in Vercel dashboard

## Important Notes

- **Free tier limitations**: Render free tier has cold starts and 15-minute inactivity timeout
- **Database**: SQLite files are ephemeral on Render. Consider using PostgreSQL for production
- **CORS**: Your backend CORS is already configured to accept all origins
- **HTTPS**: Render automatically provides HTTPS

## Troubleshooting

- Check Render logs for deployment errors
- Verify all environment variables are set
- Ensure `start` script exists in package.json
- Check that port 5000 is not hardcoded (use `process.env.PORT`)
