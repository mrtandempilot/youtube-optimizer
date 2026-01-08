-- Add tracked_keywords table
CREATE TABLE IF NOT EXISTS tracked_keywords (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_upload_id UUID REFERENCES video_uploads(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  current_rank INTEGER,
  last_checked TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(video_upload_id, keyword)
);

-- Add keyword_rankings table for historical data
CREATE TABLE IF NOT EXISTS keyword_rankings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tracked_keyword_id UUID REFERENCES tracked_keywords(id) ON DELETE CASCADE,
  rank INTEGER,
  checked_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tracked_keywords_video ON tracked_keywords(video_upload_id);
CREATE INDEX IF NOT EXISTS idx_keyword_rankings_keyword ON keyword_rankings(tracked_keyword_id);
CREATE INDEX IF NOT EXISTS idx_keyword_rankings_date ON keyword_rankings(checked_at DESC);
