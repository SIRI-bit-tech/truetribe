'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import TrustBadge from '@/components/ui/TrustBadge'
import ProfilePictureUpload from '@/components/profile/ProfilePictureUpload'
import { User } from '@/types'
import { usersAPI } from '@/lib/api'

interface HeaderProps {
  user?: User | null
  onUserUpdate?: (updatedUser: User) => void
}

export default function Header({ user, onUserUpdate }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showProfileUpload, setShowProfileUpload] = useState(false)
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    router.push('/auth/login')
  }

  const handleAvatarUpdate = (newAvatarUrl: string) => {
    const updatedUser = { ...user!, avatar: newAvatarUrl }
    onUserUpdate?.(updatedUser)
    setShowProfileUpload(false)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-dark border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-blue to-primary-purple rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-blue to-primary-purple bg-clip-text text-transparent hidden sm:block">
              TrueTribe
            </span>
          </Link>

          {/* Search Bar - Only show when logged in */}
          {user && (
            <div className="flex-1 max-w-md mx-8 hidden md:block">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search verified users..."
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-full text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
                />
                <svg className="absolute left-3 top-2.5 w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          )}

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                {/* Create Post */}
                <button className="p-2 text-white hover:text-primary-blue transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>

                {/* Notifications */}
                <button className="relative p-2 text-white hover:text-primary-blue transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.07 2.82l3.93 3.93-3.93 3.93-3.93-3.93 3.93-3.93z" />
                  </svg>
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-trust-red rounded-full"></span>
                </button>

                {/* Messages */}
                <Link href="/messages" className="p-2 text-white hover:text-primary-blue transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </Link>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center space-x-2 p-1 rounded-full hover:bg-white/10 transition-colors"
                  >
                    <Image
                      src={user.avatar || '/default-avatar.png'}
                      alt={user.username}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  </button>

                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 glass rounded-lg shadow-lg py-2">
                      <Link
                        href={`/profile/${user.username}`}
                        className="block px-4 py-2 text-white hover:bg-white/10 transition-colors"
                      >
                        Profile
                      </Link>
                      <button
                        onClick={() => setShowProfileUpload(true)}
                        className="block w-full text-left px-4 py-2 text-white hover:bg-white/10 transition-colors"
                      >
                        Update Photo
                      </button>
                      <Link
                        href="/settings"
                        className="block px-4 py-2 text-white hover:bg-white/10 transition-colors"
                      >
                        Settings
                      </Link>
                      <Link
                        href="/verification"
                        className="block px-4 py-2 text-white hover:bg-white/10 transition-colors"
                      >
                        Verification
                      </Link>
                      <hr className="my-2 border-white/10" />
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-white hover:bg-white/10 transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button variant="primary" size="sm">
                    Join TrueTribe
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Picture Upload Modal */}
      {showProfileUpload && user && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="glass rounded-2xl p-6 w-full max-w-md">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-white mb-2">Update Profile Picture</h3>
              <p className="text-white/70">Upload a new profile picture</p>
            </div>
            
            <ProfilePictureUpload
              currentAvatar={user.avatar}
              username={user.username}
              onAvatarUpdate={handleAvatarUpdate}
            />
            
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowProfileUpload(false)}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}