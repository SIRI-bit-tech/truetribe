'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Post } from '@/types'
import TrustBadge from '@/components/ui/TrustBadge'
import VerificationBadges from '@/components/ui/VerificationBadges'
import { formatTimeAgo, formatNumber } from '@/lib/utils'
import { postsAPI } from '@/lib/api'

interface PostCardProps {
  post: Post
  onUpdate?: (updatedPost: Post) => void
}

export default function PostCard({ post, onUpdate }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post?.is_liked || false)
  const [likesCount, setLikesCount] = useState(post?.likes_count || 0)
  const [isBookmarked, setIsBookmarked] = useState(post?.is_bookmarked || false)
  const [showComments, setShowComments] = useState(false)
  const [loading, setLoading] = useState(false)

  // Add null check for post.user
  if (!post || !post.user) {
    console.warn('Post or post.user is undefined:', post)
    return null
  }

  const handleLike = async () => {
    if (loading) return
    
    setLoading(true)
    try {
      if (isLiked) {
        await postsAPI.unlikePost(post.id)
        setIsLiked(false)
        setLikesCount(prev => prev - 1)
      } else {
        await postsAPI.likePost(post.id)
        setIsLiked(true)
        setLikesCount(prev => prev + 1)
      }
    } catch (error) {
      console.error('Error toggling like:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBookmark = async () => {
    if (loading) return
    
    setLoading(true)
    try {
      await postsAPI.bookmarkPost(post.id)
      setIsBookmarked(!isBookmarked)
    } catch (error) {
      console.error('Error toggling bookmark:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${post.user?.full_name || 'User'} on TrueTribe`,
          text: post.content || '',
          url: `${window.location.origin}/post/${post.id}`
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`)
    }
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="glass rounded-2xl p-6 mb-6 hover:shadow-lg transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Link href={`/profile/${post.user.username}`}>
            <Image
              src={post.user.avatar || '/default-avatar.png'}
              alt={post.user.username}
              width={48}
              height={48}
              className="rounded-full hover:scale-105 transition-transform"
            />
          </Link>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <Link 
                href={`/profile/${post.user.username}`}
                className="font-semibold text-white hover:text-primary-blue transition-colors"
              >
                {post.user.full_name}
              </Link>
              <VerificationBadges user={post.user} size="sm" maxVisible={2} />
            </div>
            
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-white/60 text-sm">@{post.user.username}</span>
              <span className="text-white/40">•</span>
              <span className="text-white/60 text-sm">{post.created_at ? formatTimeAgo(post.created_at) : 'Just now'}</span>
              {post.location && post.location.trim() && (
                <>
                  <span className="text-white/40">•</span>
                  <span className="text-white/60 text-sm">📍 {post.location}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <TrustBadge score={post.trust_score || 0} size="sm" />
          {post.fact_checked === true && (
            <div className="w-6 h-6 bg-trust-green rounded-full flex items-center justify-center" title="Fact Checked">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-white leading-relaxed whitespace-pre-wrap">
          {post.content || 'No content available'}
        </p>
        
        {/* Hashtags */}
        {post.hashtags && post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {post.hashtags.map((hashtag, index) => (
              <Link
                key={index}
                href={`/explore/hashtag/${hashtag.replace('#', '')}`}
                className="text-primary-blue hover:text-blue-400 transition-colors"
              >
                {hashtag}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Images */}
      {post.images && post.images.length > 0 && (
        <div className={`mb-4 grid gap-2 ${
          post.images.length === 1 ? 'grid-cols-1' :
          post.images.length === 2 ? 'grid-cols-2' :
          post.images.length === 3 ? 'grid-cols-2' : 'grid-cols-2'
        }`}>
          {post.images.slice(0, 4).map((image, index) => (
            <div
              key={index}
              className={`relative overflow-hidden rounded-lg ${
                post.images.length === 3 && index === 0 ? 'col-span-2' : ''
              }`}
            >
              <Image
                src={image}
                alt={`Post image ${index + 1}`}
                width={500}
                height={300}
                className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300"
              />
              {post.images.length > 4 && index === 3 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white text-xl font-semibold">
                    +{post.images.length - 4}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <div className="flex items-center space-x-6">
          {/* Like */}
          <button
            onClick={handleLike}
            disabled={loading}
            className={`flex items-center space-x-2 transition-colors ${
              isLiked ? 'text-trust-red' : 'text-white/60 hover:text-trust-red'
            }`}
          >
            <svg className="w-6 h-6" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="text-sm font-medium">{formatNumber(likesCount)}</span>
          </button>

          {/* Comment */}
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 text-white/60 hover:text-primary-blue transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-sm font-medium">{formatNumber(post.comments_count || 0)}</span>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="flex items-center space-x-2 text-white/60 hover:text-primary-blue transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
            <span className="text-sm font-medium">{formatNumber(post.shares_count || 0)}</span>
          </button>
        </div>

        {/* Bookmark */}
        <button
          onClick={handleBookmark}
          disabled={loading}
          className={`transition-colors ${
            isBookmarked ? 'text-primary-yellow' : 'text-white/60 hover:text-primary-yellow'
          }`}
        >
          <svg className="w-6 h-6" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
          className="mt-4 pt-4 border-t border-white/10"
        >
          <div className="text-white/60 text-sm text-center py-4">
            Comments feature coming soon...
          </div>
        </motion.div>
      )}
    </motion.article>
  )
}