# Adding Supabase to Vercel (Production)

## Step 1: Run SQL Migration in Supabase

1. Go to your Supabase dashboard: https://fqmqxqhpawhgdsdkaeez.supabase.co
2. Click **SQL Editor** in the left sidebar
3. Click **New query**
4. Copy the entire SQL from `supabase/migrations/001_create_video_uploads.sql`
5. Paste and click **Run** (or press Ctrl+Enter)
6. You should see "Success. No rows returned"

## Step 2: Add Environment Variables to Vercel

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Find your **youtube-optimizer** project and click on it
3. Click on **Settings** tab
4. Click on **Environment Variables** in the left menu
5. Add these two variables:

### Variable 1:
- **Name**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: `https://fqmqxqhpawhgdsdkaeez.supabase.co`
- **Environment**: Check all (Production, Preview, Development)
- Click **Save**

### Variable 2:
- **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxbXF4cWhwYXdoZ2RzZGthZWV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3ODgzODQsImV4cCI6MjA4MzM2NDM4NH0.wl1BcIu8iMIsGWlBg8CUiUbjQwHp6BzLipV5AiUzjN8`
- **Environment**: Check all (Production, Preview, Development)
- Click **Save**

## Step 3: Redeploy Your App

After adding the environment variables, you need to redeploy:

**Option A - Automatic (Recommended):**
1. Make a small change to any file (or just push to GitHub)
2. Vercel will automatically redeploy with the new environment variables

**Option B - Manual:**
1. Go to **Deployments** tab in Vercel
2. Click the **⋯** menu on the latest deployment
3. Click **Redeploy**
4. Confirm the redeployment

## Step 4: Verify It Works

1. Wait for deployment to complete (~2 minutes)
2. Visit your production URL: `https://youtube-optimizer.vercel.app/videos`
3. You should see:
   - 3 sample videos from the database
   - Green badge: "✅ Connected: Showing real data from your Supabase database"

## For Local Development (Optional)

If you also want to test locally, create `.env.local` in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://fqmqxqhpawhgdsdkaeez.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxbXF4cWhwYXdoZ2RzZGthZWV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3ODgzODQsImV4cCI6MjA4MzM2NDM4NH0.wl1BcIu8iMIsGWlBg8CUiUbjQwHp6BzLipV5AiUzjN8
```

Then restart your dev server.

## Troubleshooting

**"Missing Supabase environment variables" error:**
- Make sure you clicked **Save** for both variables in Vercel
- Redeploy the app after adding variables
- Check that variable names are exactly as shown (case-sensitive)

**No videos showing:**
- Verify the SQL migration ran successfully in Supabase
- Check Supabase Table Editor → `video_uploads` to see if data exists
- Check browser console for any errors
