import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Start auto-optimization for a video
export async function POST(request: NextRequest) {
    try {
        const { videoUploadId, videoId, currentRank } = await request.json()

        if (!videoUploadId || !videoId) {
            return NextResponse.json(
                { error: 'Missing videoUploadId or videoId' },
                { status: 400 }
            )
        }

        // Check if already exists
        const { data: existing } = await supabase
            .from('auto_optimization_jobs')
            .select('*')
            .eq('video_upload_id', videoUploadId)
            .single()

        if (existing) {
            // Reactivate if stopped
            const { error } = await supabase
                .from('auto_optimization_jobs')
                .update({
                    status: 'active',
                    baseline_rank: currentRank || existing.baseline_rank,
                    current_rank: currentRank || existing.current_rank
                })
                .eq('id', existing.id)

            if (error) throw error

            return NextResponse.json({
                success: true,
                message: 'Auto-optimization reactivated',
                jobId: existing.id
            })
        }

        // Create new job
        const { data: job, error } = await supabase
            .from('auto_optimization_jobs')
            .insert({
                video_upload_id: videoUploadId,
                video_id: videoId,
                baseline_rank: currentRank,
                current_rank: currentRank,
                last_rank_check: new Date().toISOString(),
                next_optimization: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
            })
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({
            success: true,
            message: 'Auto-optimization started',
            jobId: job.id
        })
    } catch (error) {
        console.error('Error starting auto-optimization:', error)
        return NextResponse.json(
            { error: 'Failed to start auto-optimization' },
            { status: 500 }
        )
    }
}

// Stop auto-optimization
export async function DELETE(request: NextRequest) {
    try {
        const { videoUploadId } = await request.json()

        if (!videoUploadId) {
            return NextResponse.json(
                { error: 'Missing videoUploadId' },
                { status: 400 }
            )
        }

        const { error } = await supabase
            .from('auto_optimization_jobs')
            .update({ status: 'stopped' })
            .eq('video_upload_id', videoUploadId)

        if (error) throw error

        return NextResponse.json({
            success: true,
            message: 'Auto-optimization stopped'
        })
    } catch (error) {
        console.error('Error stopping auto-optimization:', error)
        return NextResponse.json(
            { error: 'Failed to stop auto-optimization' },
            { status: 500 }
        )
    }
}

// Get job status
export async function GET(request: NextRequest) {
    try {
        const videoUploadId = request.nextUrl.searchParams.get('videoUploadId')

        if (!videoUploadId) {
            return NextResponse.json(
                { error: 'Missing videoUploadId' },
                { status: 400 }
            )
        }

        const { data: job, error } = await supabase
            .from('auto_optimization_jobs')
            .select('*')
            .eq('video_upload_id', videoUploadId)
            .single()

        if (error && error.code !== 'PGRST116') throw error // PGRST116 = not found

        return NextResponse.json({ job: job || null })
    } catch (error) {
        console.error('Error fetching job:', error)
        return NextResponse.json(
            { error: 'Failed to fetch job' },
            { status: 500 }
        )
    }
}
