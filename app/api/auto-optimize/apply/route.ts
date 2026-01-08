import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { updateYouTubeVideo } from '@/lib/youtube-update'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
    try {
        const { jobId, title, tags, description, videoId } = await request.json()

        if (!jobId || !title || !videoId) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Get access token from cookies
        const cookieStore = cookies()
        const accessToken = cookieStore.get('youtube_access_token')?.value

        if (!accessToken) {
            return NextResponse.json(
                { error: 'Not authenticated with YouTube' },
                { status: 401 }
            )
        }

        // Get job details
        const { data: job } = await supabase
            .from('auto_optimization_jobs')
            .select('*')
            .eq('id', jobId)
            .single()

        if (!job) {
            return NextResponse.json(
                { error: 'Job not found' },
                { status: 404 }
            )
        }

        // Get current version number
        const { data: histories } = await supabase
            .from('optimization_history')
            .select('version')
            .eq('job_id', jobId)
            .order('version', { ascending: false })
            .limit(1)

        const nextVersion = (histories?.[0]?.version || 0) + 1

        // Update YouTube video
        await updateYouTubeVideo(videoId, title, tags, description, accessToken)

        // Mark previous version as inactive
        await supabase
            .from('optimization_history')
            .update({ is_active: false })
            .eq('job_id', jobId)
            .eq('is_active', true)

        // Save new version to history
        const { error: historyError } = await supabase
            .from('optimization_history')
            .insert({
                job_id: jobId,
                version: nextVersion,
                title,
                tags,
                description,
                rank_before: job.current_rank,
                is_active: true
            })

        if (historyError) throw historyError

        // Update job
        const { error: jobError } = await supabase
            .from('auto_optimization_jobs')
            .update({
                last_optimization: new Date().toISOString(),
                next_optimization: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            })
            .eq('id', jobId)

        if (jobError) throw jobError

        return NextResponse.json({
            success: true,
            message: 'Optimization applied to YouTube',
            version: nextVersion
        })
    } catch (error) {
        console.error('Error applying optimization:', error)
        return NextResponse.json(
            { error: 'Failed to apply optimization', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        )
    }
}
