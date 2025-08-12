'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Post, Video, LiveStream } from '@/types'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { formatNumber, formatTimeAgo } from '@/lib/utils'
import { postsAPI, videosAPI, liveAPI } from '@/lib/api'

interface ProfileGridProps {
  userId: string
  activeTab: string
}

export default function ProfileGrid({ userId, activeTab }: ProfileGridProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [videos, setVideos] = useState<Video[]>([])
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadContent()
  }, [activeTab, userId])

  const loadContent = async () => {
    setLoading(true)
    try {
      switch (activeTab) {
        case 'posts':
          const postsResponse = await postsAPI.getFeed(1) // Filter by user in real implementation
          setPosts(postsResponse.data.results || [])
          break
        case 'videos':
          const videosResponse = await videosAPI.getVideoFeed(1) // Filter by user in real implementation
          setVideos(videosResponse.data.results || [])
          break
        case 'live':
          const liveResponse = await liveAPI.getLiveStreams() // Filter by user in real implementation
          setLiveStreams(liveResponse.data.results || [])
          break
      }
    } catch (error) {
      console.error('Error loading content:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const renderPostsGrid = () => (
    <div className="grid grid-cols-3 gap-1 md:gap-2">
      {posts.map((post, index) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className="aspect-square relative group cursor-pointer overflow-hidden rounded-lg"
        >
          {post.images.length > 0 ? (
            <Image
              src={post.images[0]}
              alt="Post"
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-blue to-primary-purple flex items-center justify-center">
              <span className="text-white text-2xl">📝</span>
            </div>
          )}
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center space-x-4 text-white">
              <div className="flex items-center space-x-1">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">{formatNumber(post.likes_count)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">{formatNumber(post.comments_count)}</span>
              </div>
            </div>
          </div>

          {/* Multiple Images Indicator */}
          {post.images.length > 1 && (
            <div className="absolute top-2 right-2">
              <svg className="w-5 h-5 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  )

  const renderVideosGrid = () => (
    <div className="grid grid-cols-3 gap-1 md:gap-2">
      {videos.map((video, index) => (
        <motion.div
          key={video.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className="aspect-square relative group cursor-pointer overflow-hidden rounded-lg"
        >
          <Image
            src={video.thumbnail_url}
            alt="Video"
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
          />
          
          {/* Play Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm">
              <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          {/* Stats Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-300 flex items-end p-3">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center space-x-4 text-white">
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                <span className="text-xs">{formatNumber(video.views_count)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
                <span className="text-xs">{formatNumber(video.likes_count)}</span>
              </div>
            </div>
          </div>

          {/* Duration */}
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
          </div>
        </motion.div>
      ))}
    </div>
  )

  const renderLiveGrid = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {liveStreams.map((stream, index) => (
        <motion.div
          key={stream.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className="aspect-video relative group cursor-pointer overflow-hidden rounded-lg"
        >
          <Image
            src={stream.thumbnail_url}
            alt="Live Stream"
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
          />
          
          {/* Live Badge */}
          <div className="absolute top-2 left-2">
            <div className="bg-trust-red px-2 py-1 rounded-full flex items-center space-x-1">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-white text-xs font-semibold">
                {stream.is_live ? 'LIVE' : 'ENDED'}
              </span>
            </div>
          </div>

          {/* Viewers */}
          <div className="absolute top-2 right-2 bg-black/50 px-2 py-1 rounded-full backdrop-blur-sm">
            <span className="text-white text-xs font-medium">
              {formatNumber(stream.viewers_count)} watching
            </span>
          </div>

          {/* Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
            <h3 className="text-white font-semibold text-sm line-clamp-2">{stream.title}</h3>
            <p className="text-white/70 text-xs mt-1">{formatTimeAgo(stream.started_at)}</p>
          </div>
        </motion.div>
      ))}
    </div>
  )

  const renderEmptyState = () => (
    <div className="text-center py-16">
      <div className="text-6xl mb-4">
        {activeTab === 'posts' ? '📝' : activeTab === 'videos' ? '🎥' : activeTab === 'live' ? '🔴' : '🏷️'}
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">
        No {activeTab} yet
      </h3>
      <p className="text-white/60">
        {activeTab === 'posts' && 'Share your first post to get started'}
        {activeTab === 'videos' && 'Upload your first video to showcase your content'}
        {activeTab === 'live' && 'Start your first live stream to connect with your audience'}
        {activeTab === 'tagged' && 'Posts you\'re tagged in will appear here'}
      </p>
    </div>
  )

  const hasContent = () => {
    switch (activeTab) {
      case 'posts': return posts.length > 0
      case 'videos': return videos.length > 0
      case 'live': return liveStreams.length > 0
      default: return false
    }
  }

  return (
    <div className="glass rounded-2xl p-6">
      {hasContent() ? (
        <>
          {activeTab === 'posts' && renderPostsGrid()}
          {activeTab === 'videos' && renderVideosGrid()}
          {activeTab === 'live' && renderLiveGrid()}
          {activeTab === 'tagged' && renderEmptyState()}
        </>
      ) : (
        renderEmptyState()
      )}
    </div>
  )
}