-- Auto-optimization system tables

-- Jobs table - tracks which videos are being auto-optimized
CREATE TABLE IF NOT EXISTS auto_optimization_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_upload_id UUID REFERENCES video_uploads(id) ON DELETE CASCADE,
  video_id TEXT NOT NULL,
  status TEXT DEFAULT 'active', -- active, paused, stopped
  baseline_rank INTEGER,
  current_rank INTEGER,
  last_rank_check TIMESTAMP,
  last_optimization TIMESTAMP,
  next_optimization TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(video_upload_id)
);

-- Optimization history - stores all versions of optimized content
CREATE TABLE IF NOT EXISTS optimization_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES auto_optimization_jobs(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  title TEXT NOT NULL,
  tags TEXT[],
  description TEXT,
  rank_before INTEGER,
  rank_after INTEGER,
  applied_at TIMESTAMP DEFAULT NOW(),
  reverted_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Rank history - logs every rank check
CREATE TABLE IF NOT EXISTS rank_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES auto_optimization_jobs(id) ON DELETE CASCADE,
  rank INTEGER,
  checked_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance (created AFTER tables exist)
CREATE INDEX IF NOT EXISTS idx_auto_jobs_video ON auto_optimization_jobs(video_upload_id);
CREATE INDEX IF NOT EXISTS idx_auto_jobs_status ON auto_optimization_jobs(status);
CREATE INDEX IF NOT EXISTS idx_opt_history_job ON optimization_history(job_id);
CREATE INDEX IF NOT EXISTS idx_opt_history_active ON optimization_history(is_active);
CREATE INDEX IF NOT EXISTS idx_rank_history_job ON rank_history(job_id);
CREATE INDEX IF NOT EXISTS idx_rank_history_date ON rank_history(checked_at DESC);
