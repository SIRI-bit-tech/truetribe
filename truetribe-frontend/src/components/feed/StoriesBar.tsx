'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Story, User } from '@/types'
import { storiesAPI } from '@/lib/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface StoriesBarProps {
  currentUser?: User
}

export default function StoriesBar({ currentUser }: StoriesBarProps) {
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStory, setSelectedStory] = useState<Story | null>(null)

  useEffect(() => {
    loadStories()
  }, [])

  const loadStories = async () => {
    try {
      const response = await storiesAPI.getStories()
      setStories(response.data.results || [])
    } catch (error) {
      console.error('Error loading stories:', error)
    } finally {
      setLoading(false)
    }
  }

  const groupedStories = stories.reduce((acc, story) => {
    const userId = story.user.id
    if (!acc[userId]) {
      acc[userId] = {
        user: story.user,
        stories: []
      }
    }
    acc[userId].stories.push(story)
    return acc
  }, {} as Record<string, { user: User; stories: Story[] }>)

  const storyGroups = Object.values(groupedStories)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <>
      <div className="glass rounded-2xl p-4 mb-6">
        <div className="flex items-center space-x-4 overflow-x-auto scrollbar-hide">
          {/* Add Story Button */}
          {currentUser && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-shrink-0 flex flex-col items-center space-y-2"
            >
              <div className="relative">
                <Image
                  src={currentUser.avatar || '/default-avatar.svg'}
                  alt="Your story"
                  width={64}
                  height={64}
                  className="rounded-full border-2 border-white/20"
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary-blue rounded-full flex items-center justify-center border-2 border-white">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <span className="text-xs text-white/80 font-medium">Your Story</span>
            </motion.button>
          )}

          {/* Story Groups */}
          {storyGroups.map((group, index) => {
            const hasUnviewed = group.stories.some(story => !story.is_viewed)
            
            return (
              <motion.button
                key={group.user.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedStory(group.stories[0])}
                className="flex-shrink-0 flex flex-col items-center space-y-2"
              >
                <div className={`relative p-0.5 rounded-full ${
                  hasUnviewed 
                    ? 'bg-gradient-to-r from-primary-pink via-primary-orange to-primary-yellow' 
                    : 'bg-white/20'
                }`}>
                  <Image
                    src={group.user.avatar || '/default-avatar.svg'}
                    alt={group.user.username}
                    width={64}
                    height={64}
                    className="rounded-full border-2 border-white"
                  />
                  
                  {/* Verification Badge */}
                  {group.user.id_verified && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-trust-green rounded-full flex items-center justify-center border-2 border-white">
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                
                <span className="text-xs text-white/80 font-medium max-w-16 truncate">
                  {group.user.username}
                </span>
              </motion.button>
            )
          })}

          {storyGroups.length === 0 && (
            <div className="flex-1 text-center py-8">
              <div className="text-white/60">
                <div className="text-4xl mb-2">📸</div>
                <p className="text-sm">No stories yet</p>
                <p className="text-xs text-white/40 mt-1">
                  Stories from verified users will appear here
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Story Viewer Modal */}
      {selectedStory && (
        <StoryViewer
          story={selectedStory}
          onClose={() => setSelectedStory(null)}
          onNext={() => {
            // Logic to show next story
          }}
          onPrevious={() => {
            // Logic to show previous story
          }}
        />
      )}
    </>
  )
}

interface StoryViewerProps {
  story: Story
  onClose: () => void
  onNext: () => void
  onPrevious: () => void
}

function StoryViewer({ story, onClose, onNext, onPrevious }: StoryViewerProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          onNext()
          return 0
        }
        return prev + 1
      })
    }, 50) // 5 second duration

    return () => clearInterval(timer)
  }, [onNext])

  useEffect(() => {
    // Mark story as viewed
    storiesAPI.viewStory(story.id).catch(console.error)
  }, [story.id])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center"
    >
      {/* Progress Bar */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
          <div 
            className="h-full bg-white transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Header */}
      <div className="absolute top-8 left-4 right-4 z-10 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Image
            src={story.user.avatar || '/default-avatar.svg'}
            alt={story.user.username}
            width={32}
            height={32}
            className="rounded-full"
          />
          <div>
            <p className="text-white font-semibold">{story.user.full_name}</p>
            <p className="text-white/70 text-sm">@{story.user.username}</p>
          </div>
        </div>
        
        <button
          onClick={onClose}
          className="text-white hover:text-white/70 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Story Content */}
      <div className="relative w-full h-full max-w-md mx-auto">
        {story.media_type === 'image' ? (
          <Image
            src={story.media_url}
            alt="Story"
            fill
            className="object-cover"
          />
        ) : (
          <video
            src={story.media_url}
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
          />
        )}

        {/* Navigation Areas */}
        <button
          onClick={onPrevious}
          className="absolute left-0 top-0 w-1/3 h-full z-10"
        />
        <button
          onClick={onNext}
          className="absolute right-0 top-0 w-1/3 h-full z-10"
        />
      </div>
    </motion.div>
  )
}