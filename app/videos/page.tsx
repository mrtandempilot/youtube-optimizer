'use client'

import { useState, useEffect } from 'react'
import { Video, TrendingUp, Tags, Calendar, Copy, CheckCircle, ExternalLink, Filter, ArrowUpDown, Home, Target } from 'lucide-react'
import Link from 'next/link'
import { supabase, VideoUpload } from '@/lib/supabase'
import KeywordModal from './KeywordModal'

interface VideoData {
  id: string
  videoId: string
  topic: string
  currentTitle: string
  currentTags: string[]
  seoScore: number
  currentRank: number | null
  targetRank: number
  optimizationCount: number
  lastOptimized: string
  createdAt: string
  thumbnailUrl: string
  // YouTube statistics
  viewCount?: number
  likeCount?: number
  commentCount?: number
  duration?: string
  publishedAt?: string
}

type FilterType = 'all' | 'high-score' | 'needs-optimization'
type SortType = 'recent' | 'seo-score' | 'rank'

export default function VideosPage() {
  const [videos, setVideos] = useState<VideoData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterType>('all')
  const [sort, setSort] = useState<SortType>('recent')
  const [copied, setCopied] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState<string | null>(null)
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null)
  const [analyzingRank, setAnalyzingRank] = useState<string | null>(null)
  const [rankResult, setRankResult] = useState<{ videoId: string, rank: number | null, message: string } | null>(null)

  // Fetch videos from Supabase on component mount
  useEffect(() => {
    async function fetchVideos() {
      try {
        setLoading(true)
        setError(null)

        const { data, error: fetchError } = await supabase
          .from('video_uploads')
          .select('*')
          .order('created_at', { ascending: false })

        if (fetchError) throw fetchError

        // Transform Supabase data to match VideoData interface
        const transformedData: VideoData[] = (data || []).map((video: VideoUpload) => ({
          id: video.id,
          videoId: video.video_id,
          topic: video.topic,
          currentTitle: video.current_title,
          currentTags: video.current_tags || [],
          seoScore: video.seo_score,
          currentRank: video.current_rank,
          targetRank: video.target_rank,
          optimizationCount: video.optimization_count,
          lastOptimized: video.last_optimized,
          createdAt: video.created_at,
          thumbnailUrl: video.thumbnail_url || `https://i.ytimg.com/vi/${video.video_id}/mqdefault.jpg`
        }))

        setVideos(transformedData)

        // Automatically fetch ranks and stats for all videos
        transformedData.forEach(video => {
          fetchRankForVideo(video.videoId, video.currentTitle)
          fetchVideoStats(video.videoId)
        })
      } catch (err) {
        console.error('Error fetching videos:', err)
        setError(err instanceof Error ? err.message : 'Failed to load videos')
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [])

  // Fetch rank for a single video and update state
  const fetchRankForVideo = async (videoId: string, title: string) => {
    try {
      const response = await fetch('/api/analyze-rank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId, title })
      })

      const data = await response.json()
      if (response.ok && data.rank) {
        // Update the video's rank in state
        setVideos(prevVideos =>
          prevVideos.map(v =>
            v.videoId === videoId
              ? { ...v, currentRank: data.rank }
              : v
          )
        )
      }
    } catch (error) {
      console.error(`Error fetching rank for ${videoId}:`, error)
    }
  }

  // Fetch complete video statistics
  const fetchVideoStats = async (videoId: string) => {
    try {
      const response = await fetch('/api/video-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId })
      })

      const data = await response.json()
      if (response.ok && data.video) {
        // Update video with statistics AND real tags from YouTube
        setVideos(prevVideos =>
          prevVideos.map(v =>
            v.videoId === videoId
              ? {
                ...v,
                viewCount: data.video.viewCount,
                likeCount: data.video.likeCount,
                commentCount: data.video.commentCount,
                duration: data.video.duration,
                publishedAt: data.video.publishedAt,
                currentTags: data.video.tags || v.currentTags, // Use real YouTube tags
                currentTitle: data.video.title || v.currentTitle // Use real YouTube title
              }
              : v
          )
        )
      }
    } catch (error) {
      console.error(`Error fetching stats for ${videoId}:`, error)
    }
  }

  // Handle YouTube connection
  const handleConnectYouTube = async () => {
    try {
      const response = await fetch('/api/youtube/auth')
      const data = await response.json()
      if (data.authUrl) {
        window.location.href = data.authUrl
      }
    } catch (error) {
      console.error('Error connecting to YouTube:', error)
      alert('Failed to connect to YouTube')
    }
  }

  // Handle YouTube sync
  const handleSyncYouTube = async () => {
    try {
      setSyncing(true)
      setSyncMessage('Syncing your YouTube videos...')

      const response = await fetch('/api/youtube/sync', { method: 'POST' })
      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setSyncMessage(`✅ Synced ${data.syncedCount} videos!`)

      // Refresh videos list
      const { data: refreshedData } = await supabase
        .from('video_uploads')
        .select('*')
        .order('created_at', { ascending: false })

      if (refreshedData) {
        const transformedData: VideoData[] = refreshedData.map((video: VideoUpload) => ({
          id: video.id,
          videoId: video.video_id,
          topic: video.topic,
          currentTitle: video.current_title,
          currentTags: video.current_tags || [],
          seoScore: video.seo_score,
          currentRank: video.current_rank,
          targetRank: video.target_rank,
          optimizationCount: video.optimization_count,
          lastOptimized: video.last_optimized,
          createdAt: video.created_at,
          thumbnailUrl: video.thumbnail_url || `https://i.ytimg.com/vi/${video.video_id}/mqdefault.jpg`
        }))
        setVideos(transformedData)
      }

      setTimeout(() => setSyncMessage(null), 5000)
    } catch (error) {
      console.error('Error syncing YouTube videos:', error)
      setSyncMessage('❌ Failed to sync videos')
      setTimeout(() => setSyncMessage(null), 5000)
    } finally {
      setSyncing(false)
    }
  }

  // Analyze video rank by title
  const analyzeRank = async (videoId: string, title: string) => {
    setAnalyzingRank(videoId)
    setRankResult(null)
    try {
      const response = await fetch('/api/analyze-rank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId, title })
      })

      const data = await response.json()
      if (response.ok) {
        setRankResult({ videoId, rank: data.rank, message: data.message })
        setTimeout(() => setRankResult(null), 10000) // Clear after 10 seconds
      } else {
        alert(data.error || 'Failed to analyze rank')
      }
    } catch (error) {
      console.error('Error analyzing rank:', error)
      alert('Failed to analyze rank')
    } finally {
      setAnalyzingRank(null)
    }
  }


  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const getFilteredVideos = () => {
    let filtered = [...videos]

    // Apply filter
    if (filter === 'high-score') {
      filtered = filtered.filter(v => v.seoScore >= 85)
    } else if (filter === 'needs-optimization') {
      filtered = filtered.filter(v => v.currentRank === null || v.currentRank > v.targetRank)
    }

    // Apply sort
    if (sort === 'recent') {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    } else if (sort === 'seo-score') {
      filtered.sort((a, b) => b.seoScore - a.seoScore)
    } else if (sort === 'rank') {
      filtered.sort((a, b) => {
        if (a.currentRank === null) return 1
        if (b.currentRank === null) return -1
        return a.currentRank - b.currentRank
      })
    }

    return filtered
  }

  const filteredVideos = getFilteredVideos()

  const getRankColor = (current: number | null, target: number) => {
    if (current === null) return 'text-gray-400'
    if (current <= target) return 'text-green-400'
    return 'text-yellow-400'
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'from-green-400 to-emerald-400'
    if (score >= 80) return 'from-blue-400 to-cyan-400'
    if (score >= 70) return 'from-yellow-400 to-orange-400'
    return 'from-red-400 to-pink-400'
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Video className="text-red-500" size={32} />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
                My Videos
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSyncYouTube}
                disabled={syncing}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 rounded-lg transition-colors border border-red-500"
              >
                {syncing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Syncing...</span>
                  </>
                ) : (
                  <>
                    <Video size={18} />
                    <span>Sync YouTube</span>
                  </>
                )}
              </button>
              <Link
                href="/"
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors border border-gray-700"
              >
                <Home size={18} />
                <span>Home</span>
              </Link>
            </div>
          </div>

          {/* Sync Message */}
          {syncMessage && (
            <div className={`mb-4 p-3 rounded-lg ${syncMessage.includes('✅') ? 'bg-green-500/20 border border-green-500/30 text-green-300' :
              syncMessage.includes('❌') ? 'bg-red-500/20 border border-red-500/30 text-red-300' :
                'bg-blue-500/20 border border-blue-500/30 text-blue-300'
              }`}>
              {syncMessage}
            </div>
          )}

          <p className="text-gray-400">
            Track your optimized videos and their SEO performance
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
            <div className="text-gray-400 text-sm mb-1">Total Videos</div>
            <div className="text-3xl font-bold">{videos.length}</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
            <div className="text-gray-400 text-sm mb-1">Avg SEO Score</div>
            <div className="text-3xl font-bold text-green-400">
              {Math.round(videos.reduce((acc, v) => acc + v.seoScore, 0) / videos.length)}
            </div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
            <div className="text-gray-400 text-sm mb-1">Top Ranked</div>
            <div className="text-3xl font-bold text-blue-400">
              {videos.filter(v => v.currentRank && v.currentRank <= v.targetRank).length}
            </div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
            <div className="text-gray-400 text-sm mb-1">Optimizations</div>
            <div className="text-3xl font-bold text-purple-400">
              {videos.reduce((acc, v) => acc + v.optimizationCount, 0)}
            </div>
          </div>
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Filter size={16} className="text-gray-400" />
              <span className="text-sm text-gray-400">Filter</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg transition-all ${filter === 'all'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('high-score')}
                className={`px-4 py-2 rounded-lg transition-all ${filter === 'high-score'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
              >
                High Score (85+)
              </button>
              <button
                onClick={() => setFilter('needs-optimization')}
                className={`px-4 py-2 rounded-lg transition-all ${filter === 'needs-optimization'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
              >
                Needs Optimization
              </button>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <ArrowUpDown size={16} className="text-gray-400" />
              <span className="text-sm text-gray-400">Sort By</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSort('recent')}
                className={`px-4 py-2 rounded-lg transition-all ${sort === 'recent'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
              >
                Recent
              </button>
              <button
                onClick={() => setSort('seo-score')}
                className={`px-4 py-2 rounded-lg transition-all ${sort === 'seo-score'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
              >
                SEO Score
              </button>
              <button
                onClick={() => setSort('rank')}
                className={`px-4 py-2 rounded-lg transition-all ${sort === 'rank'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
              >
                Rank
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-12 border border-gray-700 text-center">
            <Video className="mx-auto mb-4 text-gray-600 animate-pulse" size={64} />
            <h3 className="text-xl font-semibold mb-2">Loading your videos...</h3>
            <p className="text-gray-400">Please wait while we fetch your data</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 backdrop-blur-sm rounded-2xl p-12 border border-red-500/30 text-center">
            <Video className="mx-auto mb-4 text-red-500" size={64} />
            <h3 className="text-xl font-semibold mb-2 text-red-400">Error Loading Videos</h3>
            <p className="text-gray-400 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-all"
            >
              Retry
            </button>
          </div>
        ) : filteredVideos.length === 0 ? (

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-12 border border-gray-700 text-center">
            <Video className="mx-auto mb-4 text-gray-600" size={64} />
            <h3 className="text-xl font-semibold mb-2">No videos found</h3>
            <p className="text-gray-400 mb-6">
              {filter !== 'all'
                ? 'Try changing your filter settings'
                : 'Start optimizing videos to see them here'}
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 rounded-lg transition-all"
            >
              Optimize Your First Video
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredVideos.map((video) => (
              <div
                key={video.id}
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden hover:border-red-500/50 transition-all duration-300 group"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-gray-900 overflow-hidden">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.currentTitle}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${getScoreColor(video.seoScore)} text-white font-bold text-sm`}>
                      {video.seoScore}/100
                    </div>
                  </div>
                  {video.currentRank && (
                    <div className={`absolute top-3 left-3 px-3 py-1 rounded-full bg-gray-900/90 backdrop-blur-sm ${getRankColor(video.currentRank, video.targetRank)} font-bold text-sm`}>
                      Rank #{video.currentRank}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Topic */}
                  <div className="text-xs text-gray-500 mb-2 flex items-center gap-2">
                    <span className="px-2 py-1 bg-gray-700/50 rounded">
                      {video.topic}
                    </span>
                    <span>•</span>
                    <Calendar size={12} />
                    <span>{formatDate(video.createdAt)}</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold mb-3 line-clamp-2 group-hover:text-red-400 transition-colors">
                    {video.currentTitle}
                  </h3>

                  {/* Rank Result */}
                  {rankResult && rankResult.videoId === video.videoId && (
                    <div className={`mb-3 p-3 rounded-lg ${rankResult.rank && rankResult.rank <= 10
                      ? 'bg-green-500/20 border border-green-500/30'
                      : rankResult.rank
                        ? 'bg-yellow-500/20 border border-yellow-500/30'
                        : 'bg-red-500/20 border border-red-500/30'
                      }`}>
                      <div className="flex items-center gap-2">
                        {rankResult.rank && (
                          <span className={`text-2xl font-bold ${rankResult.rank <= 10 ? 'text-green-400' : 'text-yellow-400'
                            }`}>
                            #{rankResult.rank}
                          </span>
                        )}
                        <span className="text-sm text-gray-300">{rankResult.message}</span>
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Tags size={14} className="text-blue-400" />
                      <span className="text-xs text-gray-400">Tags ({video.currentTags.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {video.currentTags.slice(0, 5).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs border border-blue-500/30"
                        >
                          {tag}
                        </span>
                      ))}
                      {video.currentTags.length > 5 && (
                        <span className="px-2 py-1 bg-gray-700/50 text-gray-400 rounded text-xs">
                          +{video.currentTags.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* YouTube Statistics */}
                  {(video.viewCount || video.likeCount || video.duration) && (
                    <div className="mb-4 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {video.viewCount !== undefined && (
                          <div>
                            <span className="text-gray-400">Views:</span>
                            <span className="ml-2 font-bold text-white">{video.viewCount.toLocaleString()}</span>
                          </div>
                        )}
                        {video.likeCount !== undefined && (
                          <div>
                            <span className="text-gray-400">Likes:</span>
                            <span className="ml-2 font-bold text-green-400">{video.likeCount.toLocaleString()}</span>
                          </div>
                        )}
                        {video.commentCount !== undefined && (
                          <div>
                            <span className="text-gray-400">Comments:</span>
                            <span className="ml-2 font-bold text-blue-400">{video.commentCount.toLocaleString()}</span>
                          </div>
                        )}
                        {video.duration && (
                          <div>
                            <span className="text-gray-400">Duration:</span>
                            <span className="ml-2 font-bold text-purple-400">{video.duration}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-900/50 rounded-lg p-3">
                      <div className="text-xs text-gray-400 mb-1">Target Rank</div>
                      <div className="text-lg font-bold">#{video.targetRank}</div>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-3">
                      <div className="text-xs text-gray-400 mb-1">Optimizations</div>
                      <div className="text-lg font-bold text-purple-400">{video.optimizationCount}</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <button
                      onClick={() => analyzeRank(video.videoId, video.currentTitle)}
                      disabled={analyzingRank === video.videoId}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded-lg transition-colors text-sm font-medium"
                    >
                      {analyzingRank === video.videoId ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <TrendingUp size={16} />
                          Analyze Rank
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setSelectedVideo(video)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm"
                    >
                      <Target size={16} />
                      Keywords
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(video.currentTitle, `title-${video.id}`)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm"
                    >
                      {copied === `title-${video.id}` ? (
                        <>
                          <CheckCircle size={16} className="text-green-400" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={16} />
                          Copy
                        </>
                      )}
                    </button>
                    <a
                      href={`https://youtube.com/watch?v=${video.videoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-sm"
                    >
                      <ExternalLink size={16} />
                      View
                    </a>
                  </div>

                  {/* Last Optimized */}
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <TrendingUp size={12} />
                      Last optimized {formatDate(video.lastOptimized)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Note */}
        {!loading && !error && videos.length > 0 && (
          <div className="mt-8 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <p className="text-sm text-green-300">
              ✅ <strong>Connected:</strong> Showing real data from your Supabase database.
            </p>
          </div>
        )}
      </div>

      {/* Keyword Modal */}
      {selectedVideo && (
        <KeywordModal
          videoId={selectedVideo.videoId}
          videoUploadId={selectedVideo.id}
          videoTitle={selectedVideo.currentTitle}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </main>
  )
}
