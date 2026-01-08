import { NextRequest, NextResponse } from 'next/server'
import { getYouTubeTokens } from '@/lib/youtube'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const code = searchParams.get('code')
        const error = searchParams.get('error')

        if (error) {
            return NextResponse.redirect(new URL('/videos?error=access_denied', request.url))
        }

        if (!code) {
            return NextResponse.redirect(new URL('/videos?error=no_code', request.url))
        }

        const redirectUri = `${process.env.NEXT_PUBLIC_API_URL || 'https://youtube-optimizer.vercel.app'}/api/youtube/callback`

        const tokens = await getYouTubeTokens(code, redirectUri)

        // Store access token in cookie (in production, use secure session storage)
        const cookieStore = await cookies()
        cookieStore.set('youtube_access_token', tokens.access_token!, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 // 1 hour
        })

        if (tokens.refresh_token) {
            cookieStore.set('youtube_refresh_token', tokens.refresh_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 30 // 30 days
            })
        }

        return NextResponse.redirect(new URL('/videos?youtube_connected=true', request.url))
    } catch (error) {
        console.error('Error in YouTube OAuth callback:', error)
        return NextResponse.redirect(new URL('/videos?error=auth_failed', request.url))
    }
}
