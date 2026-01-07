# 🔐 Vercel Environment Variables Setup

## During Initial Deployment

When you deploy to Vercel for the first time, you'll see an "Environment Variables" section.

### Minimum Required (For Basic Features):

Add this ONE variable to get started:

**Name**: `OPENROUTER_API_KEY`  
**Value**: `sk-or-v1-your-actual-key-here`

Click **"Deploy"**

---

## After Deployment (For YouTube Features)

Once deployed, go to your project in Vercel:

### 1. Go to Settings
- Click your project
- Click **"Settings"** tab
- Click **"Environment Variables"**

### 2. Add These Variables

Click **"Add New"** for each:

#### Required for YouTube Integration:

| Name | Value | Example |
|------|-------|---------|
| `YOUTUBE_API_KEY` | Your YouTube Data API key | `AIzaSyC9XGp...` |
| `YOUTUBE_CLIENT_ID` | Google OAuth Client ID | `123456789-abc.apps.googleusercontent.com` |
| `YOUTUBE_CLIENT_SECRET` | Google OAuth Client Secret | `GOCSPX-abc123...` |

### 3. For All Environments

Make sure to select:
- ✅ Production
- ✅ Preview
- ✅ Development

### 4. Redeploy

After adding variables:
1. Go to **"Deployments"** tab
2. Click **"..."** on the latest deployment
3. Click **"Redeploy"**

---

## 📋 Complete Environment Variables List

Here's what each variable does:

### Essential (Frontend only):
```
OPENROUTER_API_KEY=sk-or-v1-...
```
**Purpose**: Enables AI-powered title/tag generation

### YouTube Integration:
```
YOUTUBE_API_KEY=AIzaSy...
YOUTUBE_CLIENT_ID=123456789...
YOUTUBE_CLIENT_SECRET=GOCSPX-...
```
**Purpose**: Enables ranking tracking and OAuth

### Backend (If deploying separately):
```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
DATABASE_URL=postgresql://...
```
**Purpose**: Connects frontend to monitoring backend

---

## 🎯 Quick Start Order

**Phase 1: Basic Deployment**
1. Add only `OPENROUTER_API_KEY`
2. Deploy
3. Test the app - it works for generating optimizations!

**Phase 2: YouTube Integration**
1. Set up Google Cloud OAuth (see DEPLOYMENT.md)
2. Add YouTube environment variables to Vercel
3. Redeploy
4. Now YouTube features work!

**Phase 3: Auto-Monitoring (Optional)**
1. Deploy backend to Railway
2. Add `NEXT_PUBLIC_API_URL` to Vercel
3. Redeploy
4. Full auto-optimization enabled!

---

## 🔍 Where to Find These Values

### OPENROUTER_API_KEY
1. Go to https://openrouter.ai
2. Sign up/login
3. Click **"Keys"**
4. Create new key
5. Copy it (starts with `sk-or-v1-`)

### YOUTUBE_API_KEY
1. Go to https://console.cloud.google.com
2. Create/select project
3. Enable YouTube Data API v3
4. APIs & Services → Credentials
5. Create API Key

### YOUTUBE_CLIENT_ID & SECRET
1. Same Google Cloud Console
2. APIs & Services → Credentials
3. Create OAuth 2.0 Client ID
4. Choose "Web application"
5. Add redirect URI: `https://YOUR-VERCEL-URL.vercel.app/auth/callback`
6. Copy Client ID and Secret

---

## ✅ Verify Setup

After adding all variables:

1. Go to your Vercel URL
2. Enter a topic (e.g., "cooking tutorial")
3. Click "Optimize Video"
4. You should see:
   - ✅ Competitors listed
   - ✅ 5 title variations
   - ✅ 20 tags
   - ✅ SEO score

If it works → **You're all set!** 🎉

---

## 🚨 Troubleshooting

**"Failed to generate optimization"**
- Check OPENROUTER_API_KEY is correct
- Verify you have credits in OpenRouter account

**"YouTube API error"**
- Verify YOUTUBE_API_KEY is added
- Check YouTube Data API v3 is enabled
- Confirm API key has no restrictions that block it

**"Redirect URI mismatch"**
- OAuth callback URL in Google Cloud must match exactly:
  `https://your-exact-vercel-url.vercel.app/auth/callback`

---

## 💡 Pro Tips

1. **Start Simple**: Just add OPENROUTER_API_KEY first
2. **Test Often**: Redeploy after adding each variable
3. **Security**: Never commit .env files to GitHub
4. **Costs**: Monitor OpenRouter usage - each API call costs credits

**Need help?** See DEPLOYMENT.md for detailed setup instructions.
