import { NextRequest, NextResponse } from 'next/servers'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
    try {
        const { jobId, videoId, title } = await request.json()

        if (!jobId || !videoId || !title) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Check rank using existing analyze-rank endpoint
        const rankResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/analyze-rank`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ videoId, title })
        })

        const rankData = await rankResponse.json()
        const currentRank = rankData.rank

        if (!currentRank) {
            return NextResponse.json(
                { error: 'Could not determine rank' },
                { status: 500 }
            )
        }

        // Update job with new rank
        const { error: jobError } = await supabase
            .from('auto_optimization_jobs')
            .update({
                current_rank: currentRank,
                last_rank_check: new Date().toISOString()
            })
            .eq('id', jobId)

        if (jobError) throw jobError

        // Log to rank history
        const { error: historyError } = await supabase
            .from('rank_history')
            .insert({
                job_id: jobId,
                rank: currentRank
            })

        if (historyError) throw historyError

        // Update optimization history with rank_after
        const { error: optError } = await supabase
            .from('optimization_history')
            .update({ rank_after: currentRank })
            .eq('job_id', jobId)
            .eq('is_active', true)
            .is('rank_after', null)

        if (optError) throw optError

        return NextResponse.json({
            success: true,
            rank: currentRank
        })
    } catch (error) {
        console.error('Error checking rank:', error)
        return NextResponse.json(
            { error: 'Failed to check rank' },
            { status: 500 }
        )
    }
}
