import { google } from 'googleapis'
import axios from 'axios'

const youtube = google.youtube('v3')

interface VideoInfo {
  videoId: string
  title: string
  tags: string[]
  views: number
  likes: number
  comments: number
}

interface RankingResult {
  position: number
  totalResults: number
}

export class YouTubeService {
  private apiKey: string

  constructor() {
    this.apiKey = process.env.YOUTUBE_API_KEY || ''
  }

  async getVideoInfo(videoId: string): Promise<VideoInfo | null> {
    try {
      const response = await youtube.videos.list({
        key: this.apiKey,
        part: ['snippet', 'statistics'],
        id: [videoId],
      })

      const video = response.data.items?.[0]
      if (!video) return null

      return {
        videoId,
        title: video.snippet?.title || '',
        tags: video.snippet?.tags || [],
        views: parseInt(video.statistics?.viewCount || '0'),
        likes: parseInt(video.statistics?.likeCount || '0'),
        comments: parseInt(video.statistics?.commentCount || '0'),
      }
    } catch (error) {
      console.error('Error fetching video info:', error)
      return null
    }
  }

  async searchRanking(topic: string, videoId: string): Promise<RankingResult> {
    try {
      const response = await youtube.search.list({
        key: this.apiKey,
        part: ['snippet'],
        q: topic,
        type: ['video'],
        maxResults: 50,
        order: 'relevance',
      })

      const videos = response.data.items || []
      const position = videos.findIndex((v) => v.id?.videoId === videoId) + 1

      return {
        position: position || 999,
        totalResults: parseInt(response.data.pageInfo?.totalResults?.toString() || '0'),
      }
    } catch (error) {
      console.error('Error searching ranking:', error)
      return { position: 999, totalResults: 0 }
    }
  }

  async updateVideoMetadata(
    videoId: string,
    title: string,
    tags: string[],
    accessToken: string
  ): Promise<boolean> {
    try {
      const oauth2Client = new google.auth.OAuth2()
      oauth2Client.setCredentials({ access_token: accessToken })

      await youtube.videos.update({
        auth: oauth2Client,
        part: ['snippet'],
        requestBody: {
          id: videoId,
          snippet: {
            title,
            tags,
            categoryId: '22', // People & Blogs - adjust as needed
          },
        },
      })

      return true
    } catch (error) {
      console.error('Error updating video metadata:', error)
      return false
    }
  }

  async getTopCompetitors(topic: string, limit: number = 5) {
    try {
      const response = await youtube.search.list({
        key: this.apiKey,
        part: ['snippet'],
        q: topic,
        type: ['video'],
        maxResults: limit,
        order: 'viewCount',
      })

      const videos = response.data.items || []
      const competitors = []

      for (const video of videos) {
        if (!video.id?.videoId) continue

        const channelId = video.snippet?.channelId
        if (!channelId) continue

        const channelResponse = await youtube.channels.list({
          key: this.apiKey,
          part: ['statistics', 'snippet'],
          id: [channelId],
        })

        const channel = channelResponse.data.items?.[0]
        if (!channel) continue

        competitors.push({
          videoTitle: video.snippet?.title || '',
          channelName: channel.snippet?.title || '',
          subscribers: parseInt(channel.statistics?.subscriberCount || '0'),
          views: parseInt(channel.statistics?.viewCount || '0'),
        })
      }

      return competitors
    } catch (error) {
      console.error('Error fetching competitors:', error)
      return []
    }
  }
}

export const youtubeService = new YouTubeService()
