# 🚀 Push to GitHub & Deploy to Vercel

Your code is ready! Follow these exact steps:

## Step 1: Create GitHub Repository

1. Go to **https://github.com/new**
2. Repository name: `youtube-optimizer` (or your preferred name)
3. **Keep it PUBLIC** or Private (your choice)
4. **DON'T** initialize with README (we already have one)
5. Click **"Create repository"**

## Step 2: Push Your Code

Copy your repository URL from GitHub, then run:

```bash
# Add GitHub as remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/youtube-optimizer.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Done!** Your code is now on GitHub ✅

## Step 3: Deploy to Vercel

### Quick Deploy:

1. Go to **https://vercel.com/new**
2. Sign in with GitHub
3. Click **"Import Project"**
4. Select your `youtube-optimizer` repository
5. Click **"Import"**
6. Vercel auto-detects Next.js - just click **"Deploy"**

### Add Environment Variables (IMPORTANT):

After deployment starts, click **"Environment Variables"**:

Add these:
```
OPENROUTER_API_KEY = your_openrouter_key
```

Click **"Deploy"** again.

That's it! Your app will be live at: `https://youtube-optimizer-xyz.vercel.app`

## Step 4: Configure YouTube OAuth

1. Go to **Google Cloud Console**: https://console.cloud.google.com
2. Navigate to: **APIs & Services → Credentials**
3. Click your OAuth 2.0 Client ID
4. Under **"Authorized redirect URIs"**, add:
   ```
   https://your-vercel-url.vercel.app/auth/callback
   ```
   (Replace `your-vercel-url` with your actual Vercel URL)
5. Click **Save**

## Step 5: Add YouTube Credentials to Vercel

1. In Vercel, go to your project → **Settings → Environment Variables**
2. Add:
   ```
   YOUTUBE_API_KEY = your_youtube_api_key
   YOUTUBE_CLIENT_ID = your_client_id
   YOUTUBE_CLIENT_SECRET = your_client_secret
   ```
3. Go to **Deployments** tab
4. Click **"..."** → **"Redeploy"**

## ✅ You're Live!

Your YouTube SEO Optimizer is now live on Vercel!

Test it at your Vercel URL.

---

## 🎯 Quick Reference

**Your Repository**: `https://github.com/YOUR_USERNAME/youtube-optimizer`
**Your Live App**: `https://your-app.vercel.app`

**Need Help?**
- Vercel docs: https://vercel.com/docs
- Check DEPLOYMENT.md for advanced setup
- Check QUICKSTART.md for local testing

---

## 📋 Next Steps (Optional)

### Deploy Backend for Auto-Monitoring

If you want the automated ranking monitoring feature:

1. Go to **https://railway.app**
2. New Project → Deploy from GitHub repo
3. Select `youtube-optimizer`
4. Set **Root Directory**: `server`
5. Add all environment variables
6. Deploy

Then update Vercel environment variable:
```
NEXT_PUBLIC_API_URL = https://your-backend.railway.app
```

---

**Questions?** Everything is documented in:
- README.md - Complete documentation
- DEPLOYMENT.md - Detailed deployment guide
- QUICKSTART.md - Local setup guide
