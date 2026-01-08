import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { google } from 'googleapis'

const youtube = google.youtube('v3')

export async function POST(request: NextRequest) {
    try {
        const { keywordId, keyword, videoId } = await request.json()

        if (!keywordId || !keyword || !videoId) {
            return NextResponse.json(
                { error: 'Missing required parameters' },
                { status: 400 }
            )
        }

        // Search YouTube for the keyword
        const searchResponse = await youtube.search.list({
            key: process.env.YOUTUBE_API_KEY,
            part: ['snippet'],
            q: keyword,
            type: ['video'],
            maxResults: 50 // Check top 50 results
        })

        // Find video position in results
        const videos = searchResponse.data.items || []
        const position = videos.findIndex(item => item.id?.videoId === videoId)

        const rank = position >= 0 ? position + 1 : null

        // Update tracked_keywords table
        const { error: updateError } = await supabase
            .from('tracked_keywords')
            .update({
                current_rank: rank,
                last_checked: new Date().toISOString()
            })
            .eq('id', keywordId)

        if (updateError) throw updateError

        // Save to ranking history
        if (rank !== null) {
            const { error: historyError } = await supabase
                .from('keyword_rankings')
                .insert({
                    tracked_keyword_id: keywordId,
                    rank: rank
                })

            if (historyError) throw historyError
        }

        return NextResponse.json({
            success: true,
            rank,
            message: rank ? `Video ranks #${rank} for "${keyword}"` : `Video not found in top 50 results for "${keyword}"`
        })
    } catch (error) {
        console.error('Error checking rank:', error)
        return NextResponse.json(
            { error: 'Failed to check rank', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        )
    }
}
