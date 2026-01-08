import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'

const youtube = google.youtube('v3')

export async function POST(request: NextRequest) {
    try {
        const { videoId, title } = await request.json()

        if (!videoId || !title) {
            return NextResponse.json(
                { error: 'Missing videoId or title' },
                { status: 400 }
            )
        }

        // Search YouTube for the video title
        const searchResponse = await youtube.search.list({
            key: process.env.YOUTUBE_API_KEY,
            part: ['snippet'],
            q: title,
            type: ['video'],
            maxResults: 50 // Check top 50 results
        })

        // Find video position in results
        const videos = searchResponse.data.items || []
        const position = videos.findIndex(item => item.id?.videoId === videoId)

        const rank = position >= 0 ? position + 1 : null

        return NextResponse.json({
            success: true,
            rank,
            searchTerm: title,
            message: rank
                ? `Video ranks #${rank} when searching for "${title}"`
                : `Video not found in top 50 results for "${title}"`
        })
    } catch (error) {
        console.error('Error analyzing rank:', error)
        return NextResponse.json(
            { error: 'Failed to analyze rank', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        )
    }
}
