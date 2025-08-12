'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { User } from '@/types'

interface BottomNavigationProps {
  user?: User | null
}

const navItems = [
  {
    name: 'Home',
    href: '/feed',
    icon: (active: boolean) => (
      <svg className={cn('w-6 h-6', active ? 'fill-current' : 'stroke-current')} fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )
  },
  {
    name: 'Search',
    href: '/explore',
    icon: (active: boolean) => (
      <svg className={cn('w-6 h-6', active ? 'fill-current' : 'stroke-current')} fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    )
  },
  {
    name: 'Reels',
    href: '/videos',
    icon: (active: boolean) => (
      <svg className={cn('w-6 h-6', active ? 'fill-current' : 'stroke-current')} fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    )
  },
  {
    name: 'Live',
    href: '/live',
    icon: (active: boolean) => (
      <div className={cn('w-6 h-6 rounded-lg flex items-center justify-center', active ? 'bg-trust-red' : 'border border-current')}>
        <div className={cn('w-2 h-2 rounded-full', active ? 'bg-white' : 'bg-current')} />
      </div>
    )
  }
]

export default function BottomNavigation({ user }: BottomNavigationProps) {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-dark border-t border-white/10 md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center p-2 transition-all duration-200',
                isActive ? 'text-white' : 'text-white/60'
              )}
            >
              {item.icon(isActive)}
              <span className={cn(
                'text-xs mt-1',
                isActive ? 'text-white font-medium' : 'text-white/60'
              )}>
                {item.name}
              </span>
            </Link>
          )
        })}
        
        {/* Profile */}
        {user && (
          <Link
            href={`/profile/${user.username}`}
            className={cn(
              'flex flex-col items-center justify-center p-2 transition-all duration-200',
              pathname.includes('/profile') ? 'text-white' : 'text-white/60'
            )}
          >
            <div className={cn(
              'w-6 h-6 rounded-full border-2 overflow-hidden',
              pathname.includes('/profile') ? 'border-white' : 'border-white/60'
            )}>
              <Image
                src={user.avatar || '/default-avatar.png'}
                alt={user.username}
                width={24}
                height={24}
                className="w-full h-full object-cover"
              />
            </div>
            <span className={cn(
              'text-xs mt-1',
              pathname.includes('/profile') ? 'text-white font-medium' : 'text-white/60'
            )}>
              Profile
            </span>
          </Link>
        )}
      </div>
    </nav>
  )
}