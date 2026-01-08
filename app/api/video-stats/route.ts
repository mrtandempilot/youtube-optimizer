import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'

const youtube = google.youtube('v3')

export async function POST(request: NextRequest) {
    try {
        const { videoId } = await request.json()

        if (!videoId) {
            return NextResponse.json(
                { error: 'Missing videoId' },
                { status: 400 }
            )
        }

        // Get detailed video information
        const response = await youtube.videos.list({
            key: process.env.YOUTUBE_API_KEY,
            part: ['snippet', 'statistics', 'contentDetails'],
            id: [videoId]
        })

        const video = response.data.items?.[0]

        if (!video) {
            return NextResponse.json(
                { error: 'Video not found' },
                { status: 404 }
            )
        }

        // Parse duration (PT1H2M10S format to readable)
        const duration = video.contentDetails?.duration || ''
        const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
        const hours = match?.[1] || '0'
        const minutes = match?.[2] || '0'
        const seconds = match?.[3] || '0'
        const formattedDuration = hours !== '0'
            ? `${hours}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`
            : `${minutes}:${seconds.padStart(2, '0')}`

        const videoData = {
            id: video.id,
            title: video.snippet?.title,
            description: video.snippet?.description,
            publishedAt: video.snippet?.publishedAt,
            channelTitle: video.snippet?.channelTitle,
            thumbnails: video.snippet?.thumbnails,
            tags: video.snippet?.tags || [],
            categoryId: video.snippet?.categoryId,
            duration: formattedDuration,
            viewCount: parseInt(video.statistics?.viewCount || '0'),
            likeCount: parseInt(video.statistics?.likeCount || '0'),
            commentCount: parseInt(video.statistics?.commentCount || '0'),
            definition: video.contentDetails?.definition,
            caption: video.contentDetails?.caption
        }

        return NextResponse.json({ success: true, video: videoData })
    } catch (error) {
        console.error('Error fetching video details:', error)
        return NextResponse.json(
            { error: 'Failed to fetch video details', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        )
    }
}
