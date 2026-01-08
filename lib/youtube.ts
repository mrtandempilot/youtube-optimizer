import { google } from 'googleapis'

const youtube = google.youtube('v3')

export interface YouTubeVideo {
    id: string
    title: string
    description: string
    thumbnailUrl: string
    publishedAt: string
    tags: string[]
    viewCount: number
    likeCount: number
    commentCount: number
}

// Get OAuth URL for user authorization
export function getYouTubeAuthUrl(redirectUri: string): string {
    const oauth2Client = new google.auth.OAuth2(
        process.env.YOUTUBE_CLIENT_ID,
        process.env.YOUTUBE_CLIENT_SECRET,
        redirectUri
    )

    const scopes = [
        'https://www.googleapis.com/auth/youtube.readonly'
    ]

    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        prompt: 'consent'
    })
}

// Exchange authorization code for access token
export async function getYouTubeTokens(code: string, redirectUri: string) {
    const oauth2Client = new google.auth.OAuth2(
        process.env.YOUTUBE_CLIENT_ID,
        process.env.YOUTUBE_CLIENT_SECRET,
        redirectUri
    )

    const { tokens } = await oauth2Client.getToken(code)
    return tokens
}

// Fetch all videos from user's channel
export async function fetchChannelVideos(accessToken: string): Promise<YouTubeVideo[]> {
    const oauth2Client = new google.auth.OAuth2()
    oauth2Client.setCredentials({ access_token: accessToken })

    const youtube = google.youtube({ version: 'v3', auth: oauth2Client })

    try {
        // Get user's channel
        const channelResponse = await youtube.channels.list({
            part: ['contentDetails'],
            mine: true
        })

        const uploadsPlaylistId = channelResponse.data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads

        if (!uploadsPlaylistId) {
            throw new Error('Could not find uploads playlist')
        }

        // Fetch all videos from uploads playlist
        const videos: YouTubeVideo[] = []
        let nextPageToken: string | undefined

        do {
            const playlistResponse = await youtube.playlistItems.list({
                part: ['snippet'],
                playlistId: uploadsPlaylistId,
                maxResults: 50,
                pageToken: nextPageToken
            })

            const videoIds = playlistResponse.data.items?.map(item => item.snippet?.resourceId?.videoId).filter(Boolean) as string[]

            if (videoIds.length > 0) {
                // Get detailed video information
                const videosResponse = await youtube.videos.list({
                    part: ['snippet', 'statistics'],
                    id: videoIds
                })

                const videoData = videosResponse.data.items?.map(video => ({
                    id: video.id!,
                    title: video.snippet?.title || '',
                    description: video.snippet?.description || '',
                    thumbnailUrl: video.snippet?.thumbnails?.medium?.url || '',
                    publishedAt: video.snippet?.publishedAt || '',
                    tags: video.snippet?.tags || [],
                    viewCount: parseInt(video.statistics?.viewCount || '0'),
                    likeCount: parseInt(video.statistics?.likeCount || '0'),
                    commentCount: parseInt(video.statistics?.commentCount || '0')
                })) || []

                videos.push(...videoData)
            }

            nextPageToken = playlistResponse.data.nextPageToken || undefined
        } while (nextPageToken)

        return videos
    } catch (error) {
        console.error('Error fetching YouTube videos:', error)
        throw error
    }
}
