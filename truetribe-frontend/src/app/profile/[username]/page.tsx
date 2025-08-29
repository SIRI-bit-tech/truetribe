'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { User } from '@/types'
import ProfileHeader from '@/components/profile/ProfileHeader'
import ProfileTabs from '@/components/profile/ProfileTabs'
import ProfileGrid from '@/components/profile/ProfileGrid'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { usersAPI } from '@/lib/api'

export default function ProfilePage() {
  const params = useParams()
  const username = params.username as string
  
  const [user, setUser] = useState<User | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState('posts')
  const [loading, setLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)

  useEffect(() => {
    loadUserData()
  }, [username])

  const loadUserData = async () => {
    try {
      // Get current user first
      const currentUserResponse = await usersAPI.getProfile()
      setCurrentUser(currentUserResponse.data)
      
      // If viewing own profile, use current user data
      if (username === currentUserResponse.data.username) {
        setUser(currentUserResponse.data)
        return
      }
      
      // Otherwise, try to get user by username (this might need backend support)
      // For now, we'll handle the case where we can't find the user
      try {
        const profileResponse = await usersAPI.getProfile(username)
        setUser(profileResponse.data)
      } catch (profileError) {
        // User not found
        setUser(null)
      }
      
      // Check if current user is following this profile
      // This would be determined by the API response in real implementation
      setIsFollowing(false)
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFollowChange = (following: boolean) => {
    setIsFollowing(following)
    if (user) {
      setUser(prev => prev ? {
        ...prev,
        followers_count: following ? prev.followers_count + 1 : prev.followers_count - 1
      } : null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">👤</div>
          <h2 className="text-2xl font-bold text-white mb-4">User Not Found</h2>
          <p className="text-white/70">The profile you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    )
  }

  const isOwnProfile = currentUser?.id === user.id

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Profile Header */}
          <ProfileHeader
            user={user}
            isOwnProfile={isOwnProfile}
            isFollowing={isFollowing}
            onFollowChange={handleFollowChange}
            onUserUpdate={(updatedUser) => setUser(updatedUser)}
          />

          {/* Profile Tabs */}
          <ProfileTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {/* Content Grid */}
          <ProfileGrid
            userId={user.id}
            activeTab={activeTab}
          />
        </motion.div>
      </div>
    </div>
  )
}