-- Create video_uploads table for tracking optimized videos
CREATE TABLE IF NOT EXISTS video_uploads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id TEXT NOT NULL,
  topic TEXT NOT NULL,
  current_title TEXT NOT NULL,
  current_tags TEXT[] DEFAULT '{}',
  seo_score INTEGER DEFAULT 0,
  current_rank INTEGER,
  target_rank INTEGER DEFAULT 5,
  optimization_count INTEGER DEFAULT 0,
  last_optimized TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  thumbnail_url TEXT,
  user_id UUID,
  UNIQUE(video_id)
);

-- Create index on video_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_video_uploads_video_id ON video_uploads(video_id);

-- Create index on user_id for faster user-specific queries
CREATE INDEX IF NOT EXISTS idx_video_uploads_user_id ON video_uploads(user_id);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_video_uploads_created_at ON video_uploads(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE video_uploads ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for now (you can restrict this later)
CREATE POLICY "Enable all access for video_uploads" ON video_uploads
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Insert sample data for testing
INSERT INTO video_uploads (video_id, topic, current_title, current_tags, seo_score, current_rank, target_rank, optimization_count, thumbnail_url)
VALUES 
  ('dQw4w9WgXcQ', 'React Tutorial for Beginners', 'Complete React Tutorial 2024 - Build Modern Web Apps Fast', 
   ARRAY['react', 'javascript', 'web development', 'tutorial', 'frontend', 'react hooks', 'react 2024'], 
   92, 3, 5, 2, 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg'),
  
  ('jNQXAC9IVRw', 'Ölüdeniz Paragliding Adventure', 'EPIC Paragliding in Ölüdeniz Turkey 🪂 Best Views Ever!', 
   ARRAY['ölüdeniz', 'paragliding', 'turkey', 'adventure', 'travel', 'fethiye', 'extreme sports'], 
   88, 7, 5, 1, 'https://i.ytimg.com/vi/jNQXAC9IVRw/mqdefault.jpg'),
  
  ('M7lc1UVf-VE', 'Fitness Tips for Weight Loss', '10 Science-Backed Weight Loss Tips That Actually Work', 
   ARRAY['fitness', 'weight loss', 'health', 'workout', 'diet', 'nutrition', 'healthy lifestyle'], 
   95, 2, 5, 3, 'https://i.ytimg.com/vi/M7lc1UVf-VE/mqdefault.jpg')
ON CONFLICT (video_id) DO NOTHING;
