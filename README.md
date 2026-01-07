# YouTube SEO Optimizer

An AI-powered YouTube video optimization system that automatically improves your video rankings through intelligent title and tag optimization.

## 🚀 Features

- **AI-Powered Analysis**: Uses multiple specialized AI models (Claude, GPT-4o) via OpenRouter for:
  - Competitor analysis
  - SEO-optimized title generation
  - Strategic tag recommendations
  
- **Automated Ranking Monitoring**: Continuously tracks your video's search position
  
- **Smart Optimization**: Automatically generates improved titles/tags when ranking falls below target
  
- **YouTube Integration**: Direct metadata updates via YouTube Data API
  
- **Analytics Dashboard**: Track ranking history, optimization attempts, and performance metrics

## 📋 Prerequisites

1. **Node.js** (v18 or higher)
2. **PostgreSQL** database (or use SQLite for development)
3. **API Keys**:
   - OpenRouter API key
   - Google Cloud Project with YouTube Data API v3 enabled
   - YouTube OAuth credentials

## 🔧 Setup Instructions

### 1. Install Dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd server
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# OpenRouter API Key (get from https://openrouter.ai)
OPENROUTER_API_KEY=your_openrouter_api_key_here

# YouTube Data API (from Google Cloud Console)
YOUTUBE_API_KEY=your_youtube_api_key_here
YOUTUBE_CLIENT_ID=your_google_oauth_client_id
YOUTUBE_CLIENT_SECRET=your_google_oauth_client_secret

# Database (PostgreSQL recommended)
DATABASE_URL=postgresql://user:password@localhost:5432/youtube_optimizer

# App Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000
BACKEND_PORT=3001
NODE_ENV=development
```

### 3. Set Up Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable **YouTube Data API v3**
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/auth/callback`
5. Copy Client ID and Client Secret to `.env`

### 4. Set Up OpenRouter

1. Sign up at [OpenRouter.ai](https://openrouter.ai)
2. Generate an API key
3. Add credits to your account
4. Copy API key to `.env`

### 5. Database Setup

**PostgreSQL (Recommended for Production):**
```bash
# Install PostgreSQL if needed
# Create database
createdb youtube_optimizer

# Tables will be created automatically on first run
```

**Option: SQLite for Development**
If you prefer SQLite for testing, modify `server/src/database/init.ts` to use SQLite instead.

## 🏃 Running the Application

### Start Frontend (Next.js)
```bash
npm run dev
```
Frontend runs on: `http://localhost:3000`

### Start Backend Server
```bash
cd server
npm run dev
```
Backend runs on: `http://localhost:3001`

### Start Monitoring System (Optional)
```bash
cd server
npm run monitor
```
This runs the automated ranking monitor that checks videos every 4 hours.

## 📖 How to Use

### 1. Generate Initial Optimization
1. Open `http://localhost:3000`
2. Enter your video topic (e.g., "Ölüdeniz kayaking")
3. Click **Optimize Video**
4. Copy the generated titles and tags
5. Upload your video to YouTube with optimized metadata

### 2. Enable Auto-Monitoring (Advanced)
1. After uploading, get your video ID from the URL
2. Use the backend API to track your video:

```bash
curl -X POST http://localhost:3001/api/youtube/track \
  -H "Content-Type: application/json" \
  -d '{
    "videoId": "YOUR_VIDEO_ID",
    "topic": "your topic",
    "targetRank": 5
  }'
```

3. The monitor will:
   - Check ranking every 4 hours
   - Generate optimized metadata if rank > target
   - Store optimization history
   - Limit to 5 optimization attempts per video

### 3. Check Video Status
```bash
curl http://localhost:3001/api/youtube/status/YOUR_VIDEO_ID
```

## 🎯 How It Works

### Multi-Model AI Architecture

1. **Competitor Analysis** → `Claude 3.5 Sonnet`
   - Deep reasoning about market dynamics
   - Identifies top 5 competitors
   - Analyzes content strategies

2. **Title Generation** → `GPT-4o`
   - Creates catchy, SEO-optimized titles
   - Optimizes for CTR and search relevance
   - Generates 5 variations

3. **Tag Generation** → `GPT-4o-mini`
   - Produces 20 strategic tags
   - Mix of broad, medium, and long-tail keywords
   - Optimized for discovery

### Automated Optimization Flow

```
Video Upload → Initial Ranking Check → Monitor Every 4 Hours
                                              ↓
                                    Rank Below Target?
                                              ↓
                           Yes → Generate Optimized Metadata
                                              ↓
                                    Update Video (via OAuth)
                                              ↓
                                    Wait 24-48 Hours
                                              ↓
                                    Check New Ranking
                                              ↓
                           Improved? → Continue Monitoring
                                              ↓
                           No? → Try Again (max 5 attempts)
```

## 🔐 Security Notes

- YouTube OAuth tokens should be stored encrypted in production
- Use HTTPS in production
- Rotate API keys regularly
- Set rate limits on API endpoints

## 📊 Database Schema

- **videos**: Stores tracked videos and current metadata
- **optimization_history**: Records all optimization attempts
- **ranking_snapshots**: Historical ranking data for analytics

## 🤝 API Endpoints

### Frontend API Routes
- `POST /api/optimize` - Generate optimization suggestions

### Backend API Routes
- `POST /api/youtube/track` - Start tracking a video
- `GET /api/youtube/status/:videoId` - Get video status
- `GET /api/youtube/list` - List all tracked videos
- `POST /api/youtube/update-metadata` - Manually update video
- `GET /api/auth/youtube/url` - Get OAuth URL
- `POST /api/auth/youtube/callback` - Handle OAuth callback

## 🐛 Troubleshooting

**TypeScript Errors**: Run `npm install` in both root and `server/` directories

**Database Connection Failed**: Check PostgreSQL is running and DATABASE_URL is correct

**YouTube API Quota**: YouTube API has daily quotas - monitor usage in Google Cloud Console

**OpenRouter Rate Limits**: Check your OpenRouter account credits and rate limits

## 📈 Future Enhancements

- [ ] Real-time dashboard with charts
- [ ] A/B testing for titles
- [ ] Thumbnail optimization
- [ ] Competitor trend analysis
- [ ] Email notifications for ranking changes
- [ ] Multi-user support with authentication

## 📄 License

MIT License - feel free to use and modify!

---

**Built with**: Next.js, TypeScript, PostgreSQL, OpenRouter, YouTube Data API v3
