import { google } from 'googleapis'

const youtube = google.youtube('v3')

export async function updateYouTubeVideo(
    videoId: string,
    title: string,
    tags: string[],
    description: string,
    accessToken: string
) {
    try {
        const oauth2Client = new google.auth.OAuth2()
        oauth2Client.setCredentials({ access_token: accessToken })

        const response = await youtube.videos.update({
            auth: oauth2Client,
            part: ['snippet'],
            requestBody: {
                id: videoId,
                snippet: {
                    title,
                    tags,
                    description,
                    categoryId: '22' // People & Blogs - adjust as needed
                }
            }
        })

        return { success: true, data: response.data }
    } catch (error) {
        console.error('Error updating YouTube video:', error)
        throw error
    }
}
