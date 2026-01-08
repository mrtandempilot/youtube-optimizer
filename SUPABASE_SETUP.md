# Supabase Setup Guide

This guide will help you set up Supabase to display real video data on your videos page.

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click **"New Project"**
4. Fill in the project details:
   - **Name**: `youtube-optimizer` (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the closest region to you
5. Click **"Create new project"**
6. Wait 2-3 minutes for the project to be created

## Step 2: Run the Database Migration

1. In your Supabase dashboard, click on the **SQL Editor** icon in the left sidebar
2. Click **"New query"**
3. Copy the entire contents of `supabase/migrations/001_create_video_uploads.sql`
4. Paste it into the SQL editor
5. Click **"Run"** or press `Ctrl+Enter`
6. You should see a success message

## Step 3: Get Your Supabase Credentials

1. In your Supabase dashboard, click on the **Settings** icon (gear) in the left sidebar
2. Click on **API** in the settings menu
3. You'll see two important values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (a long string starting with `eyJ...`)

## Step 4: Configure Environment Variables

1. In your project root, create a file called `.env.local` (if it doesn't exist)
2. Add the following lines, replacing the values with your actual Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

3. Save the file

> **Note**: The `.env.local` file is already in `.gitignore`, so your credentials won't be committed to Git.

## Step 5: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to `http://localhost:3000/videos`

3. You should see:
   - A loading spinner briefly
   - Sample videos from the database (3 videos inserted by the migration)
   - A green success message at the bottom: "✅ Connected: Showing real data from your Supabase database."

## Troubleshooting

### Error: "Missing Supabase environment variables"

- Make sure you created `.env.local` in the project root (not in a subdirectory)
- Verify the variable names are exactly: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Restart your dev server after adding environment variables

### Error: "relation 'video_uploads' does not exist"

- Make sure you ran the SQL migration in Step 2
- Check the Supabase SQL Editor for any error messages
- Verify you're connected to the correct project

### No videos showing (empty state)

- Check the Supabase **Table Editor** to see if data was inserted
- Go to **Table Editor** → **video_uploads** table
- If empty, re-run the SQL migration or manually insert test data

### Connection errors

- Verify your Supabase project is active (not paused)
- Check that your Project URL and anon key are correct
- Make sure you have internet connection

## Next Steps

Once you have the integration working:

1. **Add Real Videos**: You can add your actual YouTube videos to the database
2. **Connect to Main App**: Update your main optimization page to save results to Supabase
3. **Deploy to Production**: Add the same environment variables to your Vercel deployment

## Adding Videos Manually

To add videos manually via the Supabase dashboard:

1. Go to **Table Editor** → **video_uploads**
2. Click **"Insert row"**
3. Fill in the fields:
   - `video_id`: YouTube video ID (e.g., `dQw4w9WgXcQ`)
   - `topic`: Video topic
   - `current_title`: Current video title
   - `current_tags`: Array of tags (e.g., `{"tag1", "tag2"}`)
   - `seo_score`: Score from 0-100
   - `target_rank`: Desired ranking position
   - Other fields will auto-populate with defaults
4. Click **"Save"**

Your new video will immediately appear on the videos page!
