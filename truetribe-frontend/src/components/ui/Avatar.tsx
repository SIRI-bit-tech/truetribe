'use client'

import Image from 'next/image'
import { User } from '@/types'

interface AvatarProps {
  user?: User | null
  src?: string
  alt?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showOnlineStatus?: boolean
  className?: string
}

export default function Avatar({ 
  user, 
  src, 
  alt, 
  size = 'md', 
  showOnlineStatus = false,
  className = ''
}: AvatarProps) {
  // Determine image source and alt text
  const imageSrc = src || user?.avatar || '/default-avatar.svg'
  const imageAlt = alt || user?.username || 'User'
  
  // Size classes
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }
  
  // Border classes
  const borderClasses = 'border-2 border-white/20'
  
  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <div className={`w-full h-full rounded-full overflow-hidden ${borderClasses}`}>
        <Image
          src={imageSrc}
          alt={imageAlt}
          width={64}
          height={64}
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Online Status Indicator */}
      {showOnlineStatus && user?.is_online && (
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-trust-green rounded-full border-2 border-white" />
      )}
    </div>
  )
}
