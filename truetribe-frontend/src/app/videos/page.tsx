'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Video } from '@/types'
import VideoCard from '@/components/video/VideoCard'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { videosAPI } from '@/lib/api'

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const containerRef = useRef<HTMLDivElement>(null)
  const touchStartY = useRef<number>(0)
  const touchEndY = useRef<number>(0)

  useEffect(() => {
    loadInitialVideos()
  }, [])

  useEffect(() => {
    // Preload next videos when approaching the end
    if (currentIndex >= videos.length - 3 && hasMore && !loadingMore) {
      loadMoreVideos()
    }
  }, [currentIndex, videos.length, hasMore, loadingMore])

  const loadInitialVideos = async () => {
    try {
      const response = await videosAPI.getVideoFeed(1)
      setVideos(response.data.results || [])
      setHasMore(!!response.data.next)
    } catch (error: unknown) {
      console.error('Error loading videos:', error)
      // Handle 404 error gracefully - API endpoint might not exist yet
      if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'status' in error.response && error.response.status === 404) {
        console.warn('Videos API endpoint not found. Using mock data for development.')
        // Set empty videos array and disable pagination
        setVideos([])
        setHasMore(false)
      }
    } finally {
      setLoading(false)
    }
  }

  const loadMoreVideos = async () => {
    if (loadingMore || !hasMore) return

    setLoadingMore(true)
    try {
      const response = await videosAPI.getVideoFeed(page + 1)
      const newVideos = response.data.results || []
      
      setVideos(prev => [...prev, ...newVideos])
      setPage(prev => prev + 1)
      setHasMore(!!response.data.next)
    } catch (error: unknown) {
      console.error('Error loading more videos:', error)
      // Handle 404 error gracefully
      if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'status' in error.response && error.response.status === 404) {
        console.warn('Videos API endpoint not found. Disabling pagination.')
        setHasMore(false)
      }
    } finally {
      setLoadingMore(false)
    }
  }

  const goToNext = () => {
    if (currentIndex < videos.length - 1) {
      setCurrentIndex(prev => prev + 1)
    }
  }

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.targetTouches[0].clientY
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndY.current = e.targetTouches[0].clientY
  }

  const handleTouchEnd = () => {
    if (!touchStartY.current || !touchEndY.current) return
    
    const distance = touchStartY.current - touchEndY.current
    const isSignificantSwipe = Math.abs(distance) > 50

    if (isSignificantSwipe) {
      if (distance > 0) {
        // Swipe up - next video
        goToNext()
      } else {
        // Swipe down - previous video
        goToPrevious()
      }
    }

    touchStartY.current = 0
    touchEndY.current = 0
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault()
        goToPrevious()
        break
      case 'ArrowDown':
        e.preventDefault()
        goToNext()
        break
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, videos.length])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Show empty state when no videos
  if (videos.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="glass rounded-2xl p-12 max-w-md mx-auto"
          >
            <div className="text-6xl mb-6">🎥</div>
            <h1 className="text-3xl font-bold text-white mb-4">Videos Coming Soon!</h1>
                         <p className="text-white/70 mb-6">
               The video sharing feature is currently under development. Soon you&apos;ll be able to upload, watch, and share videos with the TrueTribe community.
             </p>
            <div className="bg-primary-blue/20 border border-primary-blue/50 rounded-xl p-4">
                             <p className="text-primary-blue text-sm">
                 <strong>What&apos;s coming:</strong> Video uploads, short-form content, live streaming, and more!
               </p>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Video Container */}
      <div
        ref={containerRef}
        className="relative w-full h-full"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <motion.div
          className="flex flex-col"
          animate={{ y: -currentIndex * window.innerHeight }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {videos.map((video, index) => (
            <div key={video.id} className="w-full h-screen flex-shrink-0">
              <VideoCard
                video={video}
                isActive={index === currentIndex}
                onUpdate={(updatedVideo) => {
                  setVideos(prev => prev.map(v => 
                    v.id === updatedVideo.id ? updatedVideo : v
                  ))
                }}
              />
            </div>
          ))}
        </motion.div>
      </div>

      {/* Navigation Indicators */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col space-y-2 z-10">
        {videos.slice(Math.max(0, currentIndex - 2), currentIndex + 3).map((_, index) => {
          const actualIndex = Math.max(0, currentIndex - 2) + index
          const isActive = actualIndex === currentIndex
          
          return (
            <button
              key={actualIndex}
              onClick={() => setCurrentIndex(actualIndex)}
              className={`w-1 h-8 rounded-full transition-all duration-200 ${
                isActive ? 'bg-white' : 'bg-white/30'
              }`}
            />
          )
        })}
      </div>

      {/* Navigation Arrows (Desktop) */}
      <div className="hidden md:block">
        {currentIndex > 0 && (
          <button
            onClick={goToPrevious}
            className="absolute top-1/2 left-4 transform -translate-y-1/2 w-12 h-12 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors z-10"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
        )}

        {currentIndex < videos.length - 1 && (
          <button
            onClick={goToNext}
            className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors z-10"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>

      {/* Loading More Indicator */}
      {loadingMore && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-black/50 rounded-full px-4 py-2 flex items-center space-x-2 backdrop-blur-sm">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span className="text-white text-sm">Loading more videos...</span>
          </div>
        </div>
      )}

      {/* Instructions Overlay (First Time) */}
      {currentIndex === 0 && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ delay: 3, duration: 1 }}
          className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none z-20"
        >
          <div className="text-center text-white">
            <div className="mb-4">
              <svg className="w-8 h-8 mx-auto animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </div>
            <p className="text-lg font-medium">Swipe up for next video</p>
            <p className="text-sm text-white/70 mt-1">Or use arrow keys</p>
          </div>
        </motion.div>
      )}
    </div>
  )
}