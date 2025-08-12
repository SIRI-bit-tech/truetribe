'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Video } from '@/types'
import TrustBadge from '@/components/ui/TrustBadge'
import VerificationBadges from '@/components/ui/VerificationBadges'
import { formatTimeAgo, formatNumber } from '@/lib/utils'
import { videosAPI } from '@/lib/api'

interface VideoCardProps {
  video: Video
  isActive: boolean
  onUpdate?: (updatedVideo: Video) => void
}

export default function VideoCard({ video, isActive, onUpdate }: VideoCardProps) {
  const [isLiked, setIsLiked] = useState(video.is_liked)
  const [likesCount, setLikesCount] = useState(video.likes_count)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const [loading, setLoading] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current) {
      if (isActive) {
        videoRef.current.play()
        setIsPlaying(true)
      } else {
        videoRef.current.pause()
        setIsPlaying(false)
      }
    }
  }, [isActive])

  const handleLike = async () => {
    if (loading) return
    
    setLoading(true)
    try {
      if (isLiked) {
        await videosAPI.likeVideo(video.id)
        setIsLiked(false)
        setLikesCount(prev => prev - 1)
      } else {
        await videosAPI.likeVideo(video.id)
        setIsLiked(true)
        setLikesCount(prev => prev + 1)
      }
    } catch (error) {
      console.error('Error toggling like:', error)
    } finally {
      setLoading(false)
    }
  }

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
        setIsPlaying(false)
      } else {
        videoRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: video.title,
          text: video.description,
          url: `${window.location.origin}/video/${video.id}`
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/video/${video.id}`)
    }
  }

  return (
    <div className="relative w-full h-screen bg-black flex items-center justify-center">
      {/* Video */}
      <video
        ref={videoRef}
        src={video.video_url}
        poster={video.thumbnail_url}
        className="w-full h-full object-cover"
        loop
        muted
        playsInline
        onClick={togglePlayPause}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      />

      {/* Play/Pause Overlay */}
      {!isPlaying && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          onClick={togglePlayPause}
          className="absolute inset-0 flex items-center justify-center bg-black/20"
        >
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          </div>
        </motion.button>
      )}

      {/* User Info Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6">
        <div className="flex items-end justify-between">
          {/* Left Side - User & Content Info */}
          <div className="flex-1 mr-4">
            {/* User Info */}
            <div className="flex items-center space-x-3 mb-4">
              <Link href={`/profile/${video.user.username}`}>
                <Image
                  src={video.user.avatar || '/default-avatar.png'}
                  alt={video.user.username}
                  width={48}
                  height={48}
                  className="rounded-full border-2 border-white hover:scale-105 transition-transform"
                />
              </Link>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <Link 
                    href={`/profile/${video.user.username}`}
                    className="font-semibold text-white hover:text-primary-blue transition-colors"
                  >
                    {video.user.full_name}
                  </Link>
                  <VerificationBadges user={video.user} size="sm" maxVisible={2} />
                </div>
                
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-white/80 text-sm">@{video.user.username}</span>
                  <span className="text-white/60">•</span>
                  <span className="text-white/80 text-sm">{formatTimeAgo(video.created_at)}</span>
                </div>
              </div>

              <TrustBadge score={video.trust_score} size="sm" />
            </div>

            {/* Video Info */}
            <div className="space-y-2">
              <h3 className="text-white font-semibold text-lg leading-tight">
                {video.title}
              </h3>
              
              {video.description && (
                <p className="text-white/90 text-sm leading-relaxed line-clamp-2">
                  {video.description}
                </p>
              )}

              {/* Hashtags */}
              {video.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {video.hashtags.slice(0, 3).map((hashtag, index) => (
                    <Link
                      key={index}
                      href={`/explore/hashtag/${hashtag.replace('#', '')}`}
                      className="text-primary-blue hover:text-blue-400 transition-colors text-sm"
                    >
                      {hashtag}
                    </Link>
                  ))}
                  {video.hashtags.length > 3 && (
                    <span className="text-white/60 text-sm">
                      +{video.hashtags.length - 3} more
                    </span>
                  )}
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center space-x-4 text-white/80 text-sm">
                <span>{formatNumber(video.views_count)} views</span>
                <span>•</span>
                <span>{formatNumber(video.likes_count)} likes</span>
                <span>•</span>
                <span>{formatNumber(video.comments_count)} comments</span>
              </div>
            </div>
          </div>

          {/* Right Side - Action Buttons */}
          <div className="flex flex-col items-center space-y-6">
            {/* Like */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleLike}
              disabled={loading}
              className={`flex flex-col items-center space-y-1 transition-colors ${
                isLiked ? 'text-trust-red' : 'text-white hover:text-trust-red'
              }`}
            >
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <svg className="w-6 h-6" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <span className="text-xs font-medium">{formatNumber(likesCount)}</span>
            </motion.button>

            {/* Comment */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="flex flex-col items-center space-y-1 text-white hover:text-primary-blue transition-colors"
            >
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <span className="text-xs font-medium">{formatNumber(video.comments_count)}</span>
            </motion.button>

            {/* Share */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleShare}
              className="flex flex-col items-center space-y-1 text-white hover:text-primary-blue transition-colors"
            >
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </div>
              <span className="text-xs font-medium">Share</span>
            </motion.button>

            {/* More Options */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="flex flex-col items-center space-y-1 text-white hover:text-white/70 transition-colors"
            >
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </div>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Video Controls (when hovering) */}
      {showControls && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute top-4 right-4 flex items-center space-x-2"
        >
          <button
            onClick={togglePlayPause}
            className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white backdrop-blur-sm"
          >
            {isPlaying ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </motion.div>
      )}
    </div>
  )
}