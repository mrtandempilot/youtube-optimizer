import { Router } from 'express'
import { google } from 'googleapis'

export const authRouter = Router()

// Use production URL in production, localhost in development
const CALLBACK_URL = process.env.NODE_ENV === 'production' 
  ? `${process.env.NEXT_PUBLIC_API_URL}/auth/callback`
  : 'http://localhost:3000/auth/callback'

const oauth2Client = new google.auth.OAuth2(
  process.env.YOUTUBE_CLIENT_ID,
  process.env.YOUTUBE_CLIENT_SECRET,
  CALLBACK_URL
)

// Generate auth URL
authRouter.get('/youtube/url', (req, res) => {
  const scopes = [
    'https://www.googleapis.com/auth/youtube',
    'https://www.googleapis.com/auth/youtube.force-ssl',
  ]

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
  })

  res.json({ authUrl: url })
})

// Handle OAuth callback
authRouter.post('/youtube/callback', async (req, res) => {
  try {
    const { code } = req.body

    if (!code) {
      return res.status(400).json({ error: 'Authorization code required' })
    }

    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)

    // Store tokens securely (in production, use encrypted database)
    res.json({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiryDate: tokens.expiry_date,
    })
  } catch (error) {
    console.error('OAuth callback error:', error)
    res.status(500).json({ error: 'Failed to authenticate' })
  }
})

// Refresh access token
authRouter.post('/youtube/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' })
    }

    oauth2Client.setCredentials({ refresh_token: refreshToken })
    const { credentials } = await oauth2Client.refreshAccessToken()

    res.json({
      accessToken: credentials.access_token,
      expiryDate: credentials.expiry_date,
    })
  } catch (error) {
    console.error('Token refresh error:', error)
    res.status(500).json({ error: 'Failed to refresh token' })
  }
})
