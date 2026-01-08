import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Add keyword to video
export async function POST(request: NextRequest) {
    try {
        const { videoUploadId, keyword } = await request.json()

        if (!videoUploadId || !keyword) {
            return NextResponse.json(
                { error: 'Missing videoUploadId or keyword' },
                { status: 400 }
            )
        }

        const { data, error } = await supabase
            .from('tracked_keywords')
            .insert({
                video_upload_id: videoUploadId,
                keyword: keyword.toLowerCase().trim()
            })
            .select()
            .single()

        if (error) {
            if (error.code === '23505') { // Unique constraint violation
                return NextResponse.json(
                    { error: 'Keyword already tracked for this video' },
                    { status: 409 }
                )
            }
            throw error
        }

        return NextResponse.json({ success: true, data })
    } catch (error) {
        console.error('Error adding keyword:', error)
        return NextResponse.json(
            { error: 'Failed to add keyword' },
            { status: 500 }
        )
    }
}

// Get keywords for a video
export async function GET(request: NextRequest) {
    try {
        const videoUploadId = request.nextUrl.searchParams.get('videoUploadId')

        if (!videoUploadId) {
            return NextResponse.json(
                { error: 'Missing videoUploadId' },
                { status: 400 }
            )
        }

        const { data, error } = await supabase
            .from('tracked_keywords')
            .select('*')
            .eq('video_upload_id', videoUploadId)
            .order('created_at', { ascending: false })

        if (error) throw error

        return NextResponse.json({ keywords: data || [] })
    } catch (error) {
        console.error('Error fetching keywords:', error)
        return NextResponse.json(
            { error: 'Failed to fetch keywords' },
            { status: 500 }
        )
    }
}

// Delete keyword
export async function DELETE(request: NextRequest) {
    try {
        const { keywordId } = await request.json()

        if (!keywordId) {
            return NextResponse.json(
                { error: 'Missing keywordId' },
                { status: 400 }
            )
        }

        const { error } = await supabase
            .from('tracked_keywords')
            .delete()
            .eq('id', keywordId)

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting keyword:', error)
        return NextResponse.json(
            { error: 'Failed to delete keyword' },
            { status: 500 }
        )
    }
}
