import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { youtubeRouter } from './routes/youtube'
import { authRouter } from './routes/auth'
import { initDatabase } from './database/init'

dotenv.config({ path: '../.env' })

const app = express()
const PORT = process.env.BACKEND_PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/youtube', youtubeRouter)
app.use('/api/auth', authRouter)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Start server
async function startServer() {
  try {
    await initDatabase()
    console.log('✅ Database initialized')
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
      console.log(`📊 Health check: http://localhost:${PORT}/health`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()
