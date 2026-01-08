-- Test: Create just one index to see if it works
CREATE INDEX IF NOT EXISTS idx_auto_jobs_video ON auto_optimization_jobs(video_upload_id);
