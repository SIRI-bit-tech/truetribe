'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { LiveStream, User } from '@/types'
import LiveStreamCard from '@/components/live/LiveStreamCard'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Button from '@/components/ui/Button'
import { liveAPI, usersAPI } from '@/lib/api'

export default function LivePage() {
  const [streams, setStreams] = useState<LiveStream[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreateStream, setShowCreateStream] = useState(false)

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      const [streamsResponse, userResponse] = await Promise.all([
        liveAPI.getLiveStreams(),
        usersAPI.getProfile()
      ])
      
      setStreams(streamsResponse.data.results || [])
      setCurrentUser(userResponse.data)
    } catch (error) {
      console.error('Error loading live streams:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleJoinStream = async (streamId: string) => {
    try {
      await liveAPI.joinStream(streamId)
      // Navigate to stream viewer
      window.location.href = `/live/watch/${streamId}`
    } catch (error) {
      console.error('Error joining stream:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              🔴 Live Streams
            </h1>
            <p className="text-white/70">
              Watch live content from verified creators in real-time
            </p>
          </div>

          {currentUser?.id_verified && (
            <Button
              onClick={() => setShowCreateStream(true)}
              variant="trust"
              size="lg"
            >
              Go Live
            </Button>
          )}
        </div>

        {/* Verification Notice */}
        {currentUser && !currentUser.id_verified && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary-blue/20 border border-primary-blue/50 rounded-2xl p-6 mb-8"
          >
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-primary-blue rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-2">Verification Required for Live Streaming</h3>
                <p className="text-white/80 text-sm mb-4">
                  Only verified users can create live streams to ensure authentic, trustworthy content for our community.
                </p>
                <Button size="sm" variant="primary">
                  Complete Verification
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Live Streams Grid */}
        {streams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {streams.map((stream, index) => (
              <LiveStreamCard
                key={stream.id}
                stream={stream}
                onJoin={handleJoinStream}
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="glass rounded-2xl p-12 max-w-lg mx-auto">
              <div className="text-8xl mb-6">📺</div>
              <h3 className="text-3xl font-bold text-white mb-4">No Live Streams</h3>
              <p className="text-white/70 text-lg mb-8">
                No verified creators are currently live. Check back soon for amazing live content!
              </p>
              <div className="space-y-3">
                <Button size="lg" className="w-full">
                  Explore Creators
                </Button>
                {currentUser?.id_verified && (
                  <Button 
                    variant="trust" 
                    size="lg" 
                    className="w-full"
                    onClick={() => setShowCreateStream(true)}
                  >
                    Start Your First Stream
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Categories Filter */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-6">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { name: 'Gaming', icon: '🎮', color: 'from-purple-500 to-pink-500' },
              { name: 'Education', icon: '📚', color: 'from-blue-500 to-cyan-500' },
              { name: 'Music', icon: '🎵', color: 'from-green-500 to-teal-500' },
              { name: 'Tech', icon: '💻', color: 'from-orange-500 to-red-500' },
              { name: 'Fitness', icon: '💪', color: 'from-yellow-500 to-orange-500' },
              { name: 'Cooking', icon: '👨‍🍳', color: 'from-red-500 to-pink-500' }
            ].map((category, index) => (
              <motion.button
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`glass rounded-xl p-6 hover:scale-105 transition-transform duration-200 bg-gradient-to-r ${category.color} bg-opacity-20`}
              >
                <div className="text-4xl mb-2">{category.icon}</div>
                <h3 className="text-white font-semibold">{category.name}</h3>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Create Stream Modal */}
      {showCreateStream && (
        <CreateStreamModal
          user={currentUser!}
          onClose={() => setShowCreateStream(false)}
          onStreamCreated={(newStream) => {
            setStreams(prev => [newStream, ...prev])
            setShowCreateStream(false)
            window.location.href = `/live/stream/${newStream.id}`
          }}
        />
      )}
    </div>
  )
}

interface CreateStreamModalProps {
  user: User
  onClose: () => void
  onStreamCreated: (stream: LiveStream) => void
}

function CreateStreamModal({ user, onClose, onStreamCreated }: CreateStreamModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'General'
  })
  const [loading, setLoading] = useState(false)

  const categories = [
    'General', 'Gaming', 'Education', 'Music', 'Tech', 'Fitness', 
    'Cooking', 'Art', 'Business', 'Entertainment', 'News', 'Sports'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    setLoading(true)
    try {
      const response = await liveAPI.startStream(formData)
      onStreamCreated(response.data)
    } catch (error) {
      console.error('Error creating stream:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass rounded-2xl p-6 w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Start Live Stream</h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Stream Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
              placeholder="What's your stream about?"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all resize-none"
              placeholder="Tell viewers what to expect..."
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
            >
              {categories.map(category => (
                <option key={category} value={category} className="bg-gray-800">
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-trust-green/20 border border-trust-green/50 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-trust-green rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="text-trust-green font-semibold mb-1">Verified Streamer</h4>
                <p className="text-white/80 text-sm">
                  Your verified status ensures viewers can trust your content and identity.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1 text-white border border-white/20"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              variant="trust"
              className="flex-1"
              disabled={loading || !formData.title.trim()}
            >
              Go Live
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}