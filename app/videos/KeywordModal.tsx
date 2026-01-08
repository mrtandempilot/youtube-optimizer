'use client'

import { useState, useEffect } from 'react'
import { X, Plus, TrendingUp, Trash2, RefreshCw } from 'lucide-react'

interface Keyword {
    id: string
    keyword: string
    current_rank: number | null
    last_checked: string | null
}

interface KeywordModalProps {
    videoId: string
    videoUploadId: string
    videoTitle: string
    onClose: () => void
}

export default function KeywordModal({ videoId, videoUploadId, videoTitle, onClose }: KeywordModalProps) {
    const [keywords, setKeywords] = useState<Keyword[]>([])
    const [newKeyword, setNewKeyword] = useState('')
    const [loading, setLoading] = useState(true)
    const [checking, setChecking] = useState<string | null>(null)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    useEffect(() => {
        fetchKeywords()
    }, [videoUploadId])

    const fetchKeywords = async () => {
        try {
            const response = await fetch(`/api/keywords?videoUploadId=${videoUploadId}`)
            const data = await response.json()
            setKeywords(data.keywords || [])
        } catch (error) {
            console.error('Error fetching keywords:', error)
        } finally {
            setLoading(false)
        }
    }

    const addKeyword = async () => {
        if (!newKeyword.trim()) return

        try {
            const response = await fetch('/api/keywords', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    videoUploadId,
                    keyword: newKeyword.trim()
                })
            })

            if (response.ok) {
                setNewKeyword('')
                fetchKeywords()
                showMessage('success', 'Keyword added!')
            } else {
                const data = await response.json()
                showMessage('error', data.error || 'Failed to add keyword')
            }
        } catch (error) {
            showMessage('error', 'Failed to add keyword')
        }
    }

    const checkRank = async (keywordId: string, keyword: string) => {
        setChecking(keywordId)
        try {
            const response = await fetch('/api/keywords/check-rank', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    keywordId,
                    keyword,
                    videoId
                })
            })

            const data = await response.json()
            if (response.ok) {
                showMessage('success', data.message)
                fetchKeywords()
            } else {
                showMessage('error', data.error || 'Failed to check rank')
            }
        } catch (error) {
            showMessage('error', 'Failed to check rank')
        } finally {
            setChecking(null)
        }
    }

    const deleteKeyword = async (keywordId: string) => {
        try {
            const response = await fetch('/api/keywords', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ keywordId })
            })

            if (response.ok) {
                fetchKeywords()
                showMessage('success', 'Keyword removed')
            }
        } catch (error) {
            showMessage('error', 'Failed to remove keyword')
        }
    }

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text })
        setTimeout(() => setMessage(null), 3000)
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-gray-700">
                {/* Header */}
                <div className="p-6 border-b border-gray-700 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Keyword Tracking</h2>
                        <p className="text-gray-400 text-sm mt-1">{videoTitle}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <X size={24} className="text-gray-400" />
                    </button>
                </div>

                {/* Message */}
                {message && (
                    <div className={`mx-6 mt-4 p-3 rounded-lg ${message.type === 'success' ? 'bg-green-500/20 border border-green-500/30 text-green-300' :
                            'bg-red-500/20 border border-red-500/30 text-red-300'
                        }`}>
                        {message.text}
                    </div>
                )}

                {/* Add Keyword */}
                <div className="p-6 border-b border-gray-700">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newKeyword}
                            onChange={(e) => setNewKeyword(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                            placeholder="Enter keyword to track (e.g., turkish coffee recipe)"
                            className="flex-1 px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                        <button
                            onClick={addKeyword}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <Plus size={18} />
                            Add
                        </button>
                    </div>
                </div>

                {/* Keywords List */}
                <div className="p-6 overflow-y-auto max-h-[50vh]">
                    {loading ? (
                        <div className="text-center text-gray-400 py-8">Loading keywords...</div>
                    ) : keywords.length === 0 ? (
                        <div className="text-center text-gray-400 py-8">
                            No keywords tracked yet. Add one above to get started!
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {keywords.map((kw) => (
                                <div key={kw.id} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <span className="text-white font-medium">{kw.keyword}</span>
                                            {kw.current_rank && (
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${kw.current_rank <= 3 ? 'bg-green-500/20 text-green-400' :
                                                        kw.current_rank <= 10 ? 'bg-blue-500/20 text-blue-400' :
                                                            kw.current_rank <= 20 ? 'bg-yellow-500/20 text-yellow-400' :
                                                                'bg-gray-500/20 text-gray-400'
                                                    }`}>
                                                    Rank #{kw.current_rank}
                                                </span>
                                            )}
                                        </div>
                                        {kw.last_checked && (
                                            <p className="text-gray-500 text-xs mt-1">
                                                Last checked: {new Date(kw.last_checked).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => checkRank(kw.id, kw.keyword)}
                                            disabled={checking === kw.id}
                                            className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg transition-colors"
                                            title="Check rank"
                                        >
                                            {checking === kw.id ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            ) : (
                                                <RefreshCw size={16} />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => deleteKeyword(kw.id)}
                                            className="p-2 bg-red-600/20 hover:bg-red-600/40 rounded-lg transition-colors"
                                            title="Remove keyword"
                                        >
                                            <Trash2 size={16} className="text-red-400" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
