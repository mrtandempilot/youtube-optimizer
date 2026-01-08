import { NextRequest, NextResponse } from 'next/server'
import { fetchChannelVideos } from '@/lib/youtube'
import { supabase } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies()
        const accessToken = cookieStore.get('youtube_access_token')?.value

        if (!accessToken) {
            return NextResponse.json(
                { error: 'Not authenticated with YouTube' },
                { status: 401 }
            )
        }

        // Fetch videos from YouTube
        const videos = await fetchChannelVideos(accessToken)

        // Sync videos to Supabase
        let syncedCount = 0
        let errorCount = 0

        for (const video of videos) {
            try {
                const { error } = await supabase
                    .from('video_uploads')
                    .upsert({
                        video_id: video.id,
                        topic: video.title.substring(0, 100), // Use title as topic
                        current_title: video.title,
                        current_tags: video.tags.slice(0, 20), // Limit to 20 tags
                        seo_score: 0, // Will be calculated later
                        current_rank: null,
                        target_rank: 5,
                        optimization_count: 0,
                        thumbnail_url: video.thumbnailUrl,
                        last_optimized: new Date().toISOString(),
                        created_at: video.publishedAt
                    }, {
                        onConflict: 'video_id'
                    })

                if (error) {
                    console.error(`Error syncing video ${video.id}:`, error)
                    errorCount++
                } else {
                    syncedCount++
                }
            } catch (err) {
                console.error(`Error processing video ${video.id}:`, err)
                errorCount++
            }
        }

        return NextResponse.json({
            success: true,
            totalVideos: videos.length,
            syncedCount,
            errorCount
        })
    } catch (error) {
        console.error('Error syncing YouTube videos:', error)
        return NextResponse.json(
            { error: 'Failed to sync videos', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        )
    }
}
