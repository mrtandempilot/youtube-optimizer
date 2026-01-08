-- Step 1: Create jobs table first
CREATE TABLE IF NOT EXISTS auto_optimization_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_upload_id UUID REFERENCES video_uploads(id) ON DELETE CASCADE,
  video_id TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  baseline_rank INTEGER,
  current_rank INTEGER,
  last_rank_check TIMESTAMP,
  last_optimization TIMESTAMP,
  next_optimization TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(video_upload_id)
);
