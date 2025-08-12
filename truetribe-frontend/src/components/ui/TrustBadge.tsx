'use client'

import { cn, formatTrustScore, getTrustScoreColor, calculateTrustLevel } from '@/lib/utils'

interface TrustBadgeProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  showLevel?: boolean
  className?: string
}

export default function TrustBadge({ score, size = 'md', showLevel = false, className }: TrustBadgeProps) {
  const sizes = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  }

  const trustLevel = calculateTrustLevel(score)
  const colorClass = getTrustScoreColor(score)

  return (
    <div className={cn(
      'inline-flex items-center rounded-full font-semibold glass border',
      sizes[size],
      colorClass,
      score >= 0.8 && 'trust-glow',
      className
    )}>
      <div className={cn(
        'w-2 h-2 rounded-full mr-2',
        score >= 0.8 ? 'bg-trust-green' : 
        score >= 0.6 ? 'bg-primary-yellow' :
        score >= 0.4 ? 'bg-primary-orange' : 'bg-trust-red'
      )} />
      {formatTrustScore(score)}%
      {showLevel && (
        <span className="ml-2 text-xs opacity-75">
          {trustLevel}
        </span>
      )}
    </div>
  )
}