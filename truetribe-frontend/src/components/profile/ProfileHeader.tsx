'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { User } from '@/types'
import Button from '@/components/ui/Button'
import TrustBadge from '@/components/ui/TrustBadge'
import VerificationBadges from '@/components/ui/VerificationBadges'
import { formatNumber } from '@/lib/utils'
import { usersAPI } from '@/lib/api'

interface ProfileHeaderProps {
  user: User
  isOwnProfile: boolean
  isFollowing?: boolean
  onFollowChange?: (following: boolean) => void
}

export default function ProfileHeader({ user, isOwnProfile, isFollowing = false, onFollowChange }: ProfileHeaderProps) {
  const [following, setFollowing] = useState(isFollowing)
  const [loading, setLoading] = useState(false)
  const [showFollowers, setShowFollowers] = useState(false)
  const [showFollowing, setShowFollowing] = useState(false)

  const handleFollowToggle = async () => {
    if (loading) return
    
    setLoading(true)
    try {
      if (following) {
        await usersAPI.unfollow(user.id)
        setFollowing(false)
        onFollowChange?.(false)
      } else {
        await usersAPI.follow(user.id)
        setFollowing(true)
        onFollowChange?.(true)
      }
    } catch (error) {
      console.error('Error toggling follow:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass rounded-2xl p-6 mb-6">
      <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
        {/* Profile Picture */}
        <div className="relative">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white/20">
            <Image
              src={user.avatar || '/default-avatar.png'}
              alt={user.username}
              width={160}
              height={160}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Online Status */}
          {user.is_online && (
            <div className="absolute bottom-2 right-2 w-6 h-6 bg-trust-green rounded-full border-4 border-white" />
          )}
        </div>

        {/* Profile Info */}
        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-white">{user.full_name}</h1>
                <VerificationBadges user={user} size="md" maxVisible={5} />
              </div>
              
              <div className="flex items-center space-x-3 mb-3">
                <p className="text-white/70 text-lg">@{user.username}</p>
                <TrustBadge score={user.trust_score} size="md" showLevel />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              {isOwnProfile ? (
                <>
                  <Button variant="secondary" size="md">
                    Edit Profile
                  </Button>
                  <Button variant="ghost" size="md" className="text-white border border-white/20">
                    Settings
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={handleFollowToggle}
                    loading={loading}
                    variant={following ? "secondary" : "primary"}
                    size="md"
                    className="px-8"
                  >
                    {following ? 'Following' : 'Follow'}
                  </Button>
                  <Button variant="ghost" size="md" className="text-white border border-white/20">
                    Message
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-8 mb-4">
            <div className="text-center">
              <div className="text-xl font-bold text-white">{formatNumber(user.posts_count)}</div>
              <div className="text-white/60 text-sm">Posts</div>
            </div>
            
            <button
              onClick={() => setShowFollowers(true)}
              className="text-center hover:opacity-80 transition-opacity"
            >
              <div className="text-xl font-bold text-white">{formatNumber(user.followers_count)}</div>
              <div className="text-white/60 text-sm">Followers</div>
            </button>
            
            <button
              onClick={() => setShowFollowing(true)}
              className="text-center hover:opacity-80 transition-opacity"
            >
              <div className="text-xl font-bold text-white">{formatNumber(user.following_count)}</div>
              <div className="text-white/60 text-sm">Following</div>
            </button>
          </div>

          {/* Bio */}
          {user.bio && (
            <div className="mb-4">
              <p className="text-white leading-relaxed">{user.bio}</p>
            </div>
          )}

          {/* Expertise Areas */}
          {user.expertise_areas.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {user.expertise_areas.map((area, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-primary-blue/20 text-primary-blue rounded-full text-sm font-medium"
                >
                  {area}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Trust Score Details */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-trust-green">
              {(user.trust_score * 100).toFixed(1)}%
            </div>
            <div className="text-white/60 text-sm">Overall Trust</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-primary-blue">
              {user.id_verified ? '✓' : '✗'}
            </div>
            <div className="text-white/60 text-sm">ID Verified</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-primary-purple">
              {user.expertise_areas.length}
            </div>
            <div className="text-white/60 text-sm">Expertise Areas</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-primary-yellow">
              {new Date(user.created_at).getFullYear()}
            </div>
            <div className="text-white/60 text-sm">Member Since</div>
          </div>
        </div>
      </div>
    </div>
  )
}