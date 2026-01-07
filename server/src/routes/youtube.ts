import { Router } from 'express'
import { pool } from '../database/init'
import { youtubeService } from '../services/youtube'

export const youtubeRouter = Router()

// Track a new video
youtubeRouter.post('/track', async (req, res) => {
  try {
    const { videoId, topic, targetRank = 5, userId } = req.body

    if (!videoId || !topic) {
      return res.status(400).json({ error: 'videoId and topic are required' })
    }

    // Get initial video info
    const videoInfo = await youtubeService.getVideoInfo(videoId)
    if (!videoInfo) {
      return res.status(404).json({ error: 'Video not found' })
    }

    // Get initial ranking
    const ranking = await youtubeService.searchRanking(topic, videoId)

    // Insert into database
    await pool.query(
      `INSERT INTO videos (video_id, topic, current_title, current_tags, target_rank, current_rank, user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (video_id) DO UPDATE 
       SET topic = $2, current_title = $3, current_tags = $4, target_rank = $5, updated_at = NOW()`,
      [videoId, topic, videoInfo.title, videoInfo.tags, targetRank, ranking.position, userId]
    )

    res.json({
      message: 'Video tracking started',
      videoId,
      currentRank: ranking.position,
      targetRank,
    })
  } catch (error) {
    console.error('Track video error:', error)
    res.status(500).json({ error: 'Failed to track video' })
  }
})

// Get video status
youtubeRouter.get('/status/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params

    const result = await pool.query(
      'SELECT * FROM videos WHERE video_id = $1',
      [videoId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Video not found' })
    }

    const video = result.rows[0]

    // Get recent ranking history
    const historyResult = await pool.query(
      `SELECT * FROM ranking_snapshots 
       WHERE video_id = $1 
       ORDER BY created_at DESC 
       LIMIT 20`,
      [videoId]
    )

    // Get optimization history
    const optimizationResult = await pool.query(
      `SELECT * FROM optimization_history 
       WHERE video_id = $1 
       ORDER BY created_at DESC 
       LIMIT 10`,
      [videoId]
    )

    res.json({
      video,
      rankingHistory: historyResult.rows,
      optimizationHistory: optimizationResult.rows,
    })
  } catch (error) {
    console.error('Get status error:', error)
    res.status(500).json({ error: 'Failed to get video status' })
  }
})

// Get all tracked videos
youtubeRouter.get('/list', async (req, res) => {
  try {
    const { userId } = req.query

    let query = 'SELECT * FROM videos ORDER BY created_at DESC'
    let params: any[] = []

    if (userId) {
      query = 'SELECT * FROM videos WHERE user_id = $1 ORDER BY created_at DESC'
      params = [userId]
    }

    const result = await pool.query(query, params)

    res.json({
      videos: result.rows,
    })
  } catch (error) {
    console.error('List videos error:', error)
    res.status(500).json({ error: 'Failed to list videos' })
  }
})

// Update video metadata (manual trigger)
youtubeRouter.post('/update-metadata', async (req, res) => {
  try {
    const { videoId, title, tags, accessToken } = req.body

    if (!videoId || !title || !tags || !accessToken) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const success = await youtubeService.updateVideoMetadata(
      videoId,
      title,
      tags,
      accessToken
    )

    if (success) {
      // Update database
      await pool.query(
        'UPDATE videos SET current_title = $1, current_tags = $2, updated_at = NOW() WHERE video_id = $3',
        [title, tags, videoId]
      )

      res.json({ message: 'Video metadata updated successfully' })
    } else {
      res.status(500).json({ error: 'Failed to update video metadata' })
    }
  } catch (error) {
    console.error('Update metadata error:', error)
    res.status(500).json({ error: 'Failed to update video metadata' })
  }
})
