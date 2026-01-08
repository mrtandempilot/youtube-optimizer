-- Enable RLS on auto-optimization tables
ALTER TABLE auto_optimization_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE optimization_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE rank_history ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (you can restrict this later based on user_id)
CREATE POLICY "Allow all for auto_optimization_jobs" ON auto_optimization_jobs FOR ALL USING (true);
CREATE POLICY "Allow all for optimization_history" ON optimization_history FOR ALL USING (true);
CREATE POLICY "Allow all for rank_history" ON rank_history FOR ALL USING (true);
