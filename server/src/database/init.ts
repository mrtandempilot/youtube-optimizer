import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function initDatabase() {
  try {
    // Create videos table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS videos (
        id SERIAL PRIMARY KEY,
        video_id VARCHAR(255) UNIQUE NOT NULL,
        topic VARCHAR(500) NOT NULL,
        current_title VARCHAR(500),
        current_tags TEXT[],
        target_rank INTEGER DEFAULT 5,
        current_rank INTEGER,
        last_optimized TIMESTAMP,
        optimization_count INTEGER DEFAULT 0,
        user_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `)

    // Create optimization_history table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS optimization_history (
        id SERIAL PRIMARY KEY,
        video_id VARCHAR(255) REFERENCES videos(video_id),
        previous_title VARCHAR(500),
        new_title VARCHAR(500),
        previous_tags TEXT[],
        new_tags TEXT[],
        previous_rank INTEGER,
        new_rank INTEGER,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)

    // Create ranking_snapshots table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ranking_snapshots (
        id SERIAL PRIMARY KEY,
        video_id VARCHAR(255) REFERENCES videos(video_id),
        rank_position INTEGER,
        views INTEGER,
        likes INTEGER,
        comments INTEGER,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)

    console.log('Database tables created successfully')
  } catch (error) {
    console.error('Database initialization error:', error)
    throw error
  }
}

export { pool }
