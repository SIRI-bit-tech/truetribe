'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Post, User } from '@/types'
import PostCard from '@/components/feed/PostCard'
import StoriesBar from '@/components/feed/StoriesBar'
import InfiniteScroll from '@/components/feed/InfiniteScroll'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Button from '@/components/ui/Button'
import { postsAPI, usersAPI } from '@/lib/api'

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [showCreatePost, setShowCreatePost] = useState(false)

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      const [feedResponse, userResponse] = await Promise.all([
        postsAPI.getFeed(1),
        usersAPI.getProfile()
      ])
      
      // Filter out posts without valid user data
      const validPosts = (feedResponse.data.results || []).filter(post => 
        post && post.user && post.user.username
      )
      
      setPosts(validPosts)
      setCurrentUser(userResponse.data)
      setHasMore(!!feedResponse.data.next)
    } catch (error) {
      console.error('Error loading feed:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMorePosts = async () => {
    if (loadingMore || !hasMore) return

    setLoadingMore(true)
    try {
      const response = await postsAPI.getFeed(page + 1)
      const newPosts = response.data.results || []
      
      // Filter out posts without valid user data
      const validNewPosts = newPosts.filter(post => 
        post && post.user && post.user.username
      )
      
      setPosts(prev => [...prev, ...validNewPosts])
      setPage(prev => prev + 1)
      setHasMore(!!response.data.next)
    } catch (error) {
      console.error('Error loading more posts:', error)
    } finally {
      setLoadingMore(false)
    }
  }

  const handlePostUpdate = (updatedPost: Post) => {
    setPosts(prev => prev.map(post => 
      post.id === updatedPost.id ? updatedPost : post
    ))
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
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Stories Bar */}
        <StoriesBar currentUser={currentUser} />

        {/* Create Post Button */}
        {currentUser && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-4 mb-6"
          >
            <div className="flex items-center space-x-3">
              <img
                src={currentUser.avatar || '/default-avatar.svg'}
                alt={currentUser.username}
                className="w-10 h-10 rounded-full"
              />
              <button
                onClick={() => setShowCreatePost(true)}
                className="flex-1 text-left px-4 py-3 bg-white/10 rounded-full text-white/70 hover:bg-white/20 transition-colors"
              >
                What&apos;s on your mind, {currentUser.first_name || currentUser.username}?
              </button>
              <Button
                onClick={() => setShowCreatePost(true)}
                size="sm"
                className="px-6"
              >
                Post
              </Button>
            </div>
          </motion.div>
        )}

        {/* Verification Notice */}
        {currentUser && !currentUser.id_verified && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary-blue/20 border border-primary-blue/50 rounded-2xl p-6 mb-6"
          >
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-primary-blue rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-2">Complete Your Verification</h3>
                <p className="text-white/80 text-sm mb-4">
                  To unlock all TrueTribe features and build trust with the community, complete your ID and face verification.
                </p>
                <Button size="sm" variant="primary">
                  Start Verification
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Feed */}
        <InfiniteScroll
          hasMore={hasMore}
          loading={loadingMore}
          onLoadMore={loadMorePosts}
        >
          {posts.length > 0 ? (
            posts.map((post, index) => (
              <PostCard
                key={post.id}
                post={post}
                onUpdate={handlePostUpdate}
              />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="glass rounded-2xl p-8 max-w-md mx-auto">
                <div className="text-6xl mb-4">🌟</div>
                <h3 className="text-2xl font-bold text-white mb-4">Welcome to TrueTribe!</h3>
                <p className="text-white/70 mb-6">
                  Your feed will show posts from verified users you follow. Start by exploring and following trusted creators.
                </p>
                <Button>
                  Explore Users
                </Button>
              </div>
            </motion.div>
          )}
        </InfiniteScroll>
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <CreatePostModal
          user={currentUser!}
          onClose={() => setShowCreatePost(false)}
          onPostCreated={(newPost) => {
            setPosts(prev => [newPost, ...prev])
            setShowCreatePost(false)
          }}
        />
      )}
    </div>
  )
}

interface CreatePostModalProps {
  user: User
  onClose: () => void
  onPostCreated: (post: Post) => void
}

function CreatePostModal({ user, onClose, onPostCreated }: CreatePostModalProps) {
  const [content, setContent] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() && images.length === 0) return

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('content', content)
      images.forEach((image, index) => {
        formData.append(`images`, image)
      })

      const response = await postsAPI.createPost(formData)
      onPostCreated(response.data)
    } catch (error) {
      console.error('Error creating post:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setImages(prev => [...prev, ...files].slice(0, 4)) // Max 4 images
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
          <h2 className="text-xl font-bold text-white">Create Post</h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-start space-x-3">
            <img
              src={user.avatar || '/default-avatar.svg'}
              alt={user.username}
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's happening?"
                className="w-full bg-transparent text-white placeholder-white/50 resize-none border-none outline-none text-lg"
                rows={4}
              />
            </div>
          </div>

          {/* Image Preview */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setImages(prev => prev.filter((_, i) => i !== index))}
                    className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div className="flex items-center space-x-4">
              <label className="cursor-pointer text-primary-blue hover:text-blue-400 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            <Button
              type="submit"
              loading={loading}
              disabled={loading || (!content.trim() && images.length === 0)}
            >
              Post
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}