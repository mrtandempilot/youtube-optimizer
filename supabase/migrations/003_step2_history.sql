-- Step 2: Create history tables (run AFTER step 1)
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

CREATE TABLE IF NOT EXISTS rank_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES auto_optimization_jobs(id) ON DELETE CASCADE,
  rank INTEGER,
  checked_at TIMESTAMP DEFAULT NOW()
);
