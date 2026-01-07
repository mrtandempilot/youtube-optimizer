# Deployment Guide - GitHub → Vercel

## 🚀 Step-by-Step Deployment

### Step 1: Push to GitHub

```bash
# Add all files
git add .

# Commit
git commit -m "Initial commit: YouTube SEO Optimizer"

# Create GitHub repo and push
# Go to https://github.com/new
# Create repository (e.g., youtube-optimizer)
# Then run:
git remote add origin https://github.com/YOUR_USERNAME/youtube-optimizer.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy Frontend to Vercel

1. Go to **https://vercel.com**
2. Sign in with GitHub
3. Click **"New Project"**
4. Import your GitHub repository
5. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (leave default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

6. **Add Environment Variables**:
   ```
   OPENROUTER_API_KEY=your_key_here
   NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app (or your backend)
   ```

7. Click **Deploy**

### Step 3: Get Your Vercel URL

After deployment completes:
- Your URL will be: `https://youtube-optimizer-xyz.vercel.app`
- Copy this URL - you'll need it for YouTube OAuth

### Step 4: Configure YouTube OAuth

1. Go to **Google Cloud Console**: https://console.cloud.google.com
2. Navigate to: **APIs & Services → Credentials**
3. Edit your OAuth 2.0 Client ID
4. **Add Authorized Redirect URI**:
   ```
   https://your-vercel-app.vercel.app/auth/callback
   ```
5. Save changes

### Step 5: Update Environment Variables

In Vercel dashboard:
1. Go to your project → **Settings → Environment Variables**
2. Add YouTube credentials:
   ```
   YOUTUBE_API_KEY=your_key
   YOUTUBE_CLIENT_ID=your_client_id
   YOUTUBE_CLIENT_SECRET=your_client_secret
   ```
3. Redeploy (Deployments tab → click "..." → Redeploy)

### Step 6: Deploy Backend (Optional - for monitoring)

**Option A: Railway (Recommended)**
1. Go to https://railway.app
2. Connect GitHub repository
3. Create new project from your repo
4. Configure:
   - **Root Directory**: `server`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Add environment variables (same as .env)
6. Deploy

**Option B: Heroku**
```bash
# Install Heroku CLI
# Create Procfile in server/:
web: npm start

# Deploy
heroku create your-app-name
heroku addons:create heroku-postgresql:mini
git subtree push --prefix server heroku main
```

**Option C: Render**
1. Go to https://render.com
2. New → Web Service
3. Connect GitHub repo
4. Configure:
   - **Root Directory**: `server`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Add environment variables
6. Create PostgreSQL database

### Step 7: Connect Frontend to Backend

Update Vercel environment variable:
```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

Redeploy the frontend.

## 🔧 Production Checklist

- [ ] GitHub repository created and code pushed
- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Railway/Heroku/Render (if using monitoring)
- [ ] PostgreSQL database created (if using monitoring)
- [ ] YouTube OAuth callback URL updated with production domain
- [ ] All environment variables set in Vercel
- [ ] Test the app at your Vercel URL

## 🌐 Environment Variables Reference

**Frontend (Vercel):**
```env
OPENROUTER_API_KEY=sk-or-v1-...
YOUTUBE_API_KEY=AIzaSy...
YOUTUBE_CLIENT_ID=123456789...
YOUTUBE_CLIENT_SECRET=GOCSPX-...
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
```

**Backend (Railway/Heroku):**
```env
OPENROUTER_API_KEY=sk-or-v1-...
YOUTUBE_API_KEY=AIzaSy...
YOUTUBE_CLIENT_ID=123456789...
YOUTUBE_CLIENT_SECRET=GOCSPX-...
DATABASE_URL=postgresql://... (auto-provided by hosting)
BACKEND_PORT=3001
NODE_ENV=production
```

## 🚨 Important Notes

1. **YouTube OAuth requires HTTPS**: Localhost won't work for OAuth callbacks
2. **Database**: Railway and Heroku provide PostgreSQL automatically
3. **CORS**: Backend CORS is configured to allow all origins (update for production)
4. **API Quotas**: YouTube API has daily quotas - monitor in Google Cloud Console
5. **Costs**: OpenRouter charges per API call, plan accordingly

## 🎯 Quick Deploy (Frontend Only)

If you just want the optimization generator (no monitoring):

1. Push to GitHub
2. Deploy to Vercel
3. Add only `OPENROUTER_API_KEY` environment variable
4. Done! ✅

The app works perfectly without the backend for basic usage.

## 🆘 Troubleshooting

**"Redirect URI mismatch"**: 
- Make sure OAuth callback URL exactly matches your Vercel URL
- Use `https://` not `http://`

**"Module not found" errors**:
- Check package.json is in root directory
- Verify all dependencies are in package.json (not devDependencies for prod)

**Database connection failed**:
- Confirm DATABASE_URL is set correctly
- Check if PostgreSQL addon is active

**OpenRouter API errors**:
- Verify API key is correct
- Check you have credits in your OpenRouter account
