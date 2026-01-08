import { NextRequest, NextResponse } from 'next/server'
import { getYouTubeAuthUrl } from '@/lib/youtube'

export async function GET(request: NextRequest) {
    try {
        const redirectUri = `${process.env.NEXT_PUBLIC_API_URL || 'https://youtube-optimizer.vercel.app'}/api/youtube/callback`

        const authUrl = getYouTubeAuthUrl(redirectUri)

        return NextResponse.json({ authUrl })
    } catch (error) {
        console.error('Error generating YouTube auth URL:', error)
        return NextResponse.json(
            { error: 'Failed to generate authorization URL' },
            { status: 500 }
        )
    }
}
