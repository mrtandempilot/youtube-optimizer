'use client'

import { useState } from 'react'
import { Search, TrendingUp, Tags, Users, Lightbulb, Copy, CheckCircle } from 'lucide-react'

interface OptimizationResult {
  competitors: Array<{
    name: string
    subscribers: string
    strategy: string
    strength: string
  }>
  titles: string[]
  tags: string[]
  seoScore: number
  recommendations: string[]
}

export default function Home() {
  const [topic, setTopic] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<OptimizationResult | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const handleOptimize = async () => {
    if (!topic.trim()) return

    setLoading(true)
    try {
      const response = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, videoUrl }),
      })
      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error('Optimization failed:', error)
      alert('Failed to optimize. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
            YouTube SEO Optimizer
          </h1>
          <p className="text-gray-400 text-lg">
            AI-powered title, tags, and competitor analysis for maximum visibility
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-gray-700">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Video Topic *
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Ölüdeniz kayaking, React tutorial, Fitness tips"
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white placeholder-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Your Video URL (Optional - for ranking tracking)
              </label>
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white placeholder-gray-500"
              />
            </div>
            <button
              onClick={handleOptimize}
              disabled={loading || !topic.trim()}
              className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Search size={20} />
                  Optimize Video
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="space-y-6">
            {/* Competitors */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <Users className="text-red-500" size={24} />
                <h2 className="text-2xl font-bold">Top Competitors</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {result.competitors.map((comp, idx) => (
                  <div key={idx} className="bg-gray-900/50 p-4 rounded-lg border border-gray-600">
                    <h3 className="font-semibold text-lg mb-2">{comp.name}</h3>
                    <p className="text-sm text-gray-400 mb-1">{comp.subscribers}</p>
                    <p className="text-sm text-gray-300 mb-2">{comp.strategy}</p>
                    <span className="inline-block px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">
                      {comp.strength}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Titles */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="text-green-500" size={24} />
                <h2 className="text-2xl font-bold">Optimized Titles</h2>
              </div>
              <div className="space-y-3">
                {result.titles.map((title, idx) => (
                  <div key={idx} className="bg-gray-900/50 p-4 rounded-lg border border-gray-600 flex justify-between items-center">
                    <span className="flex-1">{title}</span>
                    <button
                      onClick={() => copyToClipboard(title, `title-${idx}`)}
                      className="ml-4 p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      {copied === `title-${idx}` ? (
                        <CheckCircle size={18} className="text-green-500" />
                      ) : (
                        <Copy size={18} className="text-gray-400" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <Tags className="text-blue-500" size={24} />
                <h2 className="text-2xl font-bold">SEO Tags</h2>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {result.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm border border-blue-500/30"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <button
                onClick={() => copyToClipboard(result.tags.join(', '), 'tags')}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {copied === 'tags' ? (
                  <>
                    <CheckCircle size={18} />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={18} />
                    Copy All Tags
                  </>
                )}
              </button>
            </div>

            {/* Recommendations */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="text-yellow-500" size={24} />
                <h2 className="text-2xl font-bold">Recommendations</h2>
              </div>
              <div className="space-y-3">
                {result.recommendations.map((rec, idx) => (
                  <div key={idx} className="flex gap-3 items-start">
                    <div className="w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-yellow-500 text-xs font-bold">{idx + 1}</span>
                    </div>
                    <p className="text-gray-300">{rec}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* SEO Score */}
            <div className="bg-gradient-to-r from-red-600/20 to-pink-600/20 rounded-2xl p-6 border border-red-500/30">
              <div className="text-center">
                <p className="text-gray-300 mb-2">Estimated SEO Score</p>
                <div className="text-6xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
                  {result.seoScore}/100
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
