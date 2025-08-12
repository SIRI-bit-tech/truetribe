'use client'

import { User } from '@/types'
import { cn } from '@/lib/utils'

interface VerificationBadgesProps {
  user: User
  size?: 'sm' | 'md' | 'lg'
  maxVisible?: number
  className?: string
}

export default function VerificationBadges({ 
  user, 
  size = 'sm', 
  maxVisible = 3, 
  className 
}: VerificationBadgesProps) {
  const badges = []
  
  if (user.id_verified) badges.push({ type: 'ID', color: 'bg-trust-green', icon: '🆔' })
  if (user.face_verified) badges.push({ type: 'Face', color: 'bg-primary-blue', icon: '👤' })
  if (user.education_verified) badges.push({ type: 'Education', color: 'bg-primary-purple', icon: '🎓' })
  if (user.profession_verified) badges.push({ type: 'Professional', color: 'bg-primary-orange', icon: '💼' })
  if (user.location_verified) badges.push({ type: 'Location', color: 'bg-primary-yellow', icon: '📍' })

  const visibleBadges = badges.slice(0, maxVisible)
  const remainingCount = badges.length - maxVisible

  const sizes = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5'
  }

  if (badges.length === 0) return null

  return (
    <div className={cn('flex items-center gap-1 flex-wrap', className)}>
      {visibleBadges.map((badge, index) => (
        <span
          key={badge.type}
          className={cn(
            'inline-flex items-center rounded-full text-white font-medium',
            badge.color,
            sizes[size]
          )}
          title={`${badge.type} Verified`}
        >
          <span className="mr-1">{badge.icon}</span>
          {size !== 'sm' && badge.type}
        </span>
      ))}
      
      {remainingCount > 0 && (
        <span
          className={cn(
            'inline-flex items-center rounded-full bg-gray-500 text-white font-medium',
            sizes[size]
          )}
          title={`+${remainingCount} more verifications`}
        >
          +{remainingCount}
        </span>
      )}
    </div>
  )
}