-- Step 3: Create indexes (run AFTER step 2)
CREATE INDEX IF NOT EXISTS idx_auto_jobs_video ON auto_optimization_jobs(video_upload_id);
CREATE INDEX IF NOT EXISTS idx_auto_jobs_status ON auto_optimization_jobs(status);
CREATE INDEX IF NOT EXISTS idx_opt_history_job ON optimization_history(job_id);
CREATE INDEX IF NOT EXISTS idx_opt_history_active ON optimization_history(is_active);
CREATE INDEX IF NOT EXISTS idx_rank_history_job ON rank_history(job_id);
CREATE INDEX IF NOT EXISTS idx_rank_history_date ON rank_history(checked_at DESC);
