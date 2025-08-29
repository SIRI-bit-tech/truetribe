'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { LiveStream } from '@/types'
import TrustBadge from '@/components/ui/TrustBadge'
import VerificationBadges from '@/components/ui/VerificationBadges'
import Button from '@/components/ui/Button'
import { formatNumber, formatTimeAgo } from '@/lib/utils'

interface LiveStreamCardProps {
  stream: LiveStream
  onJoin?: (streamId: string) => void
}

export default function LiveStreamCard({ stream, onJoin }: LiveStreamCardProps) {
  const [joining, setJoining] = useState(false)

  const handleJoin = async () => {
    if (joining || !onJoin) return
    
    setJoining(true)
    try {
      await onJoin(stream.id)
    } catch (error) {
      console.error('Error joining stream:', error)
    } finally {
      setJoining(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="glass rounded-2xl overflow-hidden hover:scale-105 transition-transform duration-300"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video">
        <Image
          src={stream.thumbnail_url}
          alt={stream.title}
          fill
          className="object-cover"
        />
        
        {/* Live Badge */}
        <div className="absolute top-3 left-3 flex items-center space-x-2">
          <div className="bg-trust-red px-3 py-1 rounded-full flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-white text-sm font-semibold">LIVE</span>
          </div>
          <div className="bg-black/50 px-2 py-1 rounded-full backdrop-blur-sm">
            <span className="text-white text-sm font-medium">
              {formatNumber(stream.viewers_count)} watching
            </span>
          </div>
        </div>

        {/* Duration */}
        <div className="absolute top-3 right-3 bg-black/50 px-2 py-1 rounded-full backdrop-blur-sm">
          <span className="text-white text-sm font-medium">
            {formatTimeAgo(stream.started_at)}
          </span>
        </div>

        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
          <Button
            onClick={handleJoin}
            loading={joining}
            variant="trust"
            size="lg"
            className="px-8"
          >
            Join Live
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* User Info */}
        <div className="flex items-center space-x-3 mb-3">
          <Link href={`/profile/${stream.user.username}`}>
            <Image
              src={stream.user.avatar || '/default-avatar.svg'}
              alt={stream.user.username}
              width={40}
              height={40}
              className="rounded-full hover:scale-105 transition-transform"
            />
          </Link>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <Link 
                href={`/profile/${stream.user.username}`}
                className="font-semibold text-white hover:text-primary-blue transition-colors"
              >
                {stream.user.full_name}
              </Link>
              <VerificationBadges user={stream.user} size="sm" maxVisible={2} />
            </div>
            
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-white/60 text-sm">@{stream.user.username}</span>
              <TrustBadge score={stream.user.trust_score} size="sm" />
            </div>
          </div>
        </div>

        {/* Stream Info */}
        <div className="space-y-2">
          <h3 className="text-white font-semibold text-lg leading-tight line-clamp-2">
            {stream.title}
          </h3>
          
          {stream.description && (
            <p className="text-white/80 text-sm leading-relaxed line-clamp-2">
              {stream.description}
            </p>
          )}

          {/* Category */}
          <div className="flex items-center justify-between">
            <span className="inline-block bg-primary-blue/20 text-primary-blue px-3 py-1 rounded-full text-sm font-medium">
              {stream.category}
            </span>
            
            <div className="flex items-center space-x-4 text-white/60 text-sm">
              <span>{formatNumber(stream.viewers_count)} viewers</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-4">
          <Button
            onClick={handleJoin}
            loading={joining}
            className="w-full"
            disabled={joining}
          >
            {joining ? 'Joining...' : 'Watch Live'}
          </Button>
        </div>
      </div>
    </motion.div>
  )
}