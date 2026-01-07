# Quick Start Guide

Get your YouTube Optimizer running in 5 minutes!

## 🚦 Fast Setup

### Step 1: Get Your API Keys (5 min)

**OpenRouter** (for AI):
1. Go to https://openrouter.ai
2. Sign up and get API key
3. Add $5+ credits to your account

**Google Cloud** (for YouTube):
1. Go to https://console.cloud.google.com
2. Create project → Enable "YouTube Data API v3"
3. Create OAuth credentials (Web app)
4. Note: Client ID and Secret

### Step 2: Configure Environment

Copy `.env.example` to `.env` and fill in:
```env
OPENROUTER_API_KEY=sk-or-v1-...
YOUTUBE_API_KEY=AIzaSy...
YOUTUBE_CLIENT_ID=123456789...
YOUTUBE_CLIENT_SECRET=GOCSPX-...
DATABASE_URL=postgresql://localhost:5432/youtube_optimizer
```

### Step 3: Install & Run

```bash
# Install frontend
npm install

# Install backend
cd server
npm install
cd ..

# Start frontend (Terminal 1)
npm run dev

# Start backend (Terminal 2 - optional for monitoring)
cd server
npm run dev
```

### Step 4: Use It!

1. Open http://localhost:3000
2. Enter topic: "Ölüdeniz kayaking"
3. Click "Optimize Video"
4. Copy generated titles and tags
5. Upload to YouTube!

## 💡 Pro Tips

**Without Backend:**
- Frontend works standalone
- Just generates optimization suggestions
- Perfect for manual uploads

**With Backend:**
- Enables auto-monitoring
- Tracks ranking changes
- Automatic re-optimization
- Requires PostgreSQL database

## 🎯 Simple Workflow

```
Enter Topic → Generate → Copy Results → Upload to YouTube
```

That's it! For advanced features (auto-monitoring), see README.md

## 🆘 Troubleshooting

**"Cannot find module"**: Run `npm install` in both root and `server/`

**No AI response**: Check OpenRouter API key and credits

**YouTube quota exceeded**: Wait 24 hours or create new project

## 📝 Minimum Setup (No Backend)

Just want to generate optimizations? Skip the backend!

1. Install frontend only: `npm install`
2. Add only OPENROUTER_API_KEY to `.env`
3. Run: `npm run dev`
4. Use the web interface at localhost:3000

✅ **Perfect for getting started!**
