'use client'

import { useState } from 'react'
import { Sparkles, Copy, RefreshCw, Calendar, TrendingUp } from 'lucide-react'

interface PostHistory {
  topic: string
  post: string
  date: string
}

export default function Home() {
  const [topic, setTopic] = useState('')
  const [tone, setTone] = useState('professional')
  const [length, setLength] = useState('medium')
  const [generatedPost, setGeneratedPost] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [history, setHistory] = useState<PostHistory[]>([])

  const generatePost = async () => {
    if (!topic.trim()) {
      alert('Please enter a topic')
      return
    }

    setLoading(true)
    setGeneratedPost('')

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic, tone, length }),
      })

      const data = await response.json()

      if (data.error) {
        alert(data.error)
        return
      }

      setGeneratedPost(data.post)

      // Add to history
      const newHistory: PostHistory = {
        topic,
        post: data.post,
        date: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
      }
      setHistory(prev => [newHistory, ...prev.slice(0, 9)])
    } catch (error) {
      alert('Failed to generate post. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPost)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const predefinedTopics = [
    'AI and Machine Learning',
    'Career Growth',
    'Leadership',
    'Productivity',
    'Technology Trends',
    'Professional Development',
    'Entrepreneurship',
    'Work-Life Balance'
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-10 h-10 text-blue-600" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              LinkedIn Post Generator
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            AI-powered agent to create engaging LinkedIn posts daily
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Generator Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Input Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
              <div className="space-y-6">
                {/* Topic Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Post Topic
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Enter your topic (e.g., AI in healthcare, Leadership tips)"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    onKeyDown={(e) => e.key === 'Enter' && generatePost()}
                  />
                </div>

                {/* Quick Topics */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Quick Topics
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {predefinedTopics.map((t) => (
                      <button
                        key={t}
                        onClick={() => setTopic(t)}
                        className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tone Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tone
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['professional', 'casual', 'inspirational'].map((t) => (
                      <button
                        key={t}
                        onClick={() => setTone(t)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          tone === t
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Length Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Length
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['short', 'medium', 'long'].map((l) => (
                      <button
                        key={l}
                        onClick={() => setLength(l)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          length === l
                            ? 'bg-purple-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {l.charAt(0).toUpperCase() + l.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  onClick={generatePost}
                  disabled={loading || !topic.trim()}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-semibold text-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate Post
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Generated Post Display */}
            {generatedPost && (
              <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">Your Post</h2>
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div className="prose max-w-none">
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-lg border-2 border-gray-200 whitespace-pre-wrap text-gray-800 leading-relaxed">
                    {generatedPost}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-800">Stats</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm text-gray-600">Posts Generated</span>
                  <span className="font-bold text-blue-600">{history.length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm text-gray-600">Today</span>
                  <span className="font-bold text-purple-600">
                    {history.filter(h => h.date === new Date().toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })).length}
                  </span>
                </div>
              </div>
            </div>

            {/* History Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-gray-800">Recent Posts</h3>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {history.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">No posts yet</p>
                ) : (
                  history.map((item, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => {
                        setTopic(item.topic)
                        setGeneratedPost(item.post)
                      }}
                    >
                      <p className="font-medium text-gray-800 text-sm truncate">
                        {item.topic}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{item.date}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>Powered by AI • Generate unlimited LinkedIn posts</p>
        </div>
      </div>
    </main>
  )
}
