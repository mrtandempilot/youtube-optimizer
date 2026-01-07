import cron from 'node-cron'
import { pool } from './database/init'
import { youtubeService } from './services/youtube'
import { openRouterService } from './services/openrouter'
import dotenv from 'dotenv'

dotenv.config({ path: '../.env' })

interface VideoRecord {
  video_id: string
  topic: string
  current_title: string
  current_tags: string[]
  target_rank: number
  current_rank: number
  last_optimized: Date | null
  optimization_count: number
  user_id: string
}

async function monitorVideos() {
  console.log('🔍 Starting video monitoring cycle...', new Date().toISOString())

  try {
    // Get all videos that need monitoring
    const result = await pool.query<VideoRecord>(`
      SELECT * FROM videos 
      WHERE optimization_count < 5 
      ORDER BY created_at DESC
    `)

    const videos = result.rows

    console.log(`Found ${videos.length} videos to monitor`)

    for (const video of videos) {
      try {
        // Check current ranking
        const ranking = await youtubeService.searchRanking(video.topic, video.video_id)
        console.log(`Video ${video.video_id}: Rank ${ranking.position} (Target: ${video.target_rank})`)

        // Update current rank
        await pool.query(
          'UPDATE videos SET current_rank = $1, updated_at = NOW() WHERE video_id = $2',
          [ranking.position, video.video_id]
        )

        // Save ranking snapshot
        const videoInfo = await youtubeService.getVideoInfo(video.video_id)
        if (videoInfo) {
          await pool.query(
            `INSERT INTO ranking_snapshots (video_id, rank_position, views, likes, comments)
             VALUES ($1, $2, $3, $4, $5)`,
            [video.video_id, ranking.position, videoInfo.views, videoInfo.likes, videoInfo.comments]
          )
        }

        // Check if optimization is needed
        const shouldOptimize = await openRouterService.shouldOptimize(
          ranking.position,
          video.target_rank,
          video.last_optimized
        )

        if (shouldOptimize && ranking.position > video.target_rank) {
          console.log(`🔧 Optimizing video ${video.video_id}...`)

          // Generate optimized metadata
          const optimization = await openRouterService.optimizeForRanking({
            currentTitle: video.current_title,
            currentTags: video.current_tags,
            topic: video.topic,
            currentRank: ranking.position,
            targetRank: video.target_rank,
          })

          console.log(`New title: ${optimization.newTitle}`)
          console.log(`Reasoning: ${optimization.reasoning}`)

          // Save to optimization history
          await pool.query(
            `INSERT INTO optimization_history 
             (video_id, previous_title, new_title, previous_tags, new_tags, previous_rank, new_rank)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              video.video_id,
              video.current_title,
              optimization.newTitle,
              video.current_tags,
              optimization.newTags,
              ranking.position,
              null, // new_rank will be updated in next cycle
            ]
          )

          // Update video record
          await pool.query(
            `UPDATE videos 
             SET current_title = $1, current_tags = $2, last_optimized = NOW(), 
                 optimization_count = optimization_count + 1, updated_at = NOW()
             WHERE video_id = $3`,
            [optimization.newTitle, optimization.newTags, video.video_id]
          )

          console.log(`✅ Video ${video.video_id} optimized (Attempt ${video.optimization_count + 1}/5)`)
          
          // Note: Actual YouTube API update would require OAuth token
          // This would be done through the web interface when user approves changes
        }
      } catch (error) {
        console.error(`Error processing video ${video.video_id}:`, error)
      }
    }

    console.log('✅ Monitoring cycle complete\n')
  } catch (error) {
    console.error('Monitoring error:', error)
  }
}

// Run every 4 hours
cron.schedule('0 */4 * * *', () => {
  monitorVideos()
})

console.log('📊 YouTube Optimizer Monitor Started')
console.log('⏰ Running every 4 hours')
console.log('First run in 10 seconds...\n')

// Run once on startup (after 10 seconds)
setTimeout(() => {
  monitorVideos()
}, 10000)
