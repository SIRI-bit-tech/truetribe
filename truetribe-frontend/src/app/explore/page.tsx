'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { User, Post } from '@/types'
import TrustBadge from '@/components/ui/TrustBadge'
import VerificationBadges from '@/components/ui/VerificationBadges'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { formatNumber } from '@/lib/utils'
import { usersAPI, postsAPI } from '@/lib/api'

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('posts')
  const [posts, setPosts] = useState<Post[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadExploreContent()
  }, [activeTab])

  const loadExploreContent = async () => {
    setLoading(true)
    try {
      if (activeTab === 'posts') {
        const response = await postsAPI.getFeed(1)
        setPosts(response.data.results || [])
      } else {
        const response = await usersAPI.searchUsers('', 1)
        setUsers(response.data.results || [])
      }
    } catch (error) {
      console.error('Error loading explore content:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setLoading(true)
    try {
      if (activeTab === 'posts') {
        // Search posts - implement in real API
        const response = await postsAPI.getFeed(1)
        setPosts(response.data.results || [])
      } else {
        const response = await usersAPI.searchUsers(searchQuery, 1)
        setUsers(response.data.results || [])
      }
    } catch (error) {
      console.error('Error searching:', error)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'posts', label: 'Posts', icon: '📝' },
    { id: 'people', label: 'People', icon: '👥' },
    { id: 'hashtags', label: 'Tags', icon: '#️⃣' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Search Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="glass rounded-2xl p-6">
            <h1 className="text-3xl font-bold text-white mb-6">Explore</h1>
            
            {/* Search Bar */}
            <div className="relative mb-6">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search verified users, posts, and hashtags..."
                className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-full text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all text-lg"
              />
              <svg className="absolute left-4 top-4 w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <button
                onClick={handleSearch}
                className="absolute right-2 top-2 px-6 py-2 bg-primary-blue text-white rounded-full hover:bg-blue-600 transition-colors"
              >
                Search
              </button>
            </div>

            {/* Tabs */}
            <div className="flex items-center space-x-1 bg-white/5 rounded-full p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-full transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-primary-blue text-white'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {/* Posts Grid */}
            {activeTab === 'posts' && (
              <div className="grid grid-cols-3 gap-1 md:gap-2">
                {posts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="aspect-square relative group cursor-pointer overflow-hidden rounded-lg"
                  >
                    {post.images.length > 0 ? (
                      <Image
                        src={post.images[0]}
                        alt="Post"
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary-blue to-primary-purple flex items-center justify-center">
                        <span className="text-white text-2xl">📝</span>
                      </div>
                    )}
                    
                    {/* Trust Badge */}
                    <div className="absolute top-2 left-2">
                      <TrustBadge score={post.trust_score} size="sm" />
                    </div>

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center space-x-4 text-white">
                        <div className="flex items-center space-x-1">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm font-medium">{formatNumber(post.likes_count)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm font-medium">{formatNumber(post.comments_count)}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* People Grid */}
            {activeTab === 'people' && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {users.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Link href={`/profile/${user.username}`}>
                      <div className="glass rounded-2xl p-6 text-center hover:scale-105 transition-transform duration-300">
                        <div className="relative mb-4">
                          <div className="w-20 h-20 rounded-full overflow-hidden mx-auto border-4 border-white/20">
                            <Image
                              src={user.avatar || '/default-avatar.png'}
                              alt={user.username}
                              width={80}
                              height={80}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          {user.is_online && (
                            <div className="absolute bottom-0 right-1/2 transform translate-x-1/2 translate-y-1/2 w-4 h-4 bg-trust-green rounded-full border-2 border-white" />
                          )}
                        </div>
                        
                        <div className="mb-3">
                          <h3 className="text-white font-semibold text-lg mb-1">{user.full_name}</h3>
                          <p className="text-white/60 text-sm">@{user.username}</p>
                        </div>

                        <div className="mb-3">
                          <VerificationBadges user={user} size="sm" maxVisible={3} />
                        </div>

                        <div className="mb-4">
                          <TrustBadge score={user.trust_score} size="sm" showLevel />
                        </div>

                        <div className="flex justify-center space-x-4 text-white/60 text-sm mb-4">
                          <div className="text-center">
                            <div className="font-semibold text-white">{formatNumber(user.posts_count)}</div>
                            <div>Posts</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-white">{formatNumber(user.followers_count)}</div>
                            <div>Followers</div>
                          </div>
                        </div>

                        {user.bio && (
                          <p className="text-white/70 text-sm line-clamp-2 mb-4">{user.bio}</p>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Hashtags */}
            {activeTab === 'hashtags' && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">#️⃣</div>
                <h3 className="text-2xl font-semibold text-white mb-4">Trending Hashtags</h3>
                <p className="text-white/70 mb-8">Discover what verified users are talking about</p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
                  {[
                    '#TrueTribe', '#Verified', '#TrustScore', '#NoScams',
                    '#AuthenticContent', '#RealPeople', '#SafeSocial', '#TrustNetwork'
                  ].map((hashtag, index) => (
                    <motion.div
                      key={hashtag}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="glass rounded-xl p-4 hover:scale-105 transition-transform duration-300 cursor-pointer"
                    >
                      <div className="text-primary-blue font-bold text-lg mb-2">{hashtag}</div>
                      <div className="text-white/60 text-sm">{Math.floor(Math.random() * 1000)}K posts</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && ((activeTab === 'posts' && posts.length === 0) || (activeTab === 'people' && users.length === 0)) && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">
              {activeTab === 'posts' ? '📝' : '👥'}
            </div>
            <h3 className="text-2xl font-semibold text-white mb-4">
              No {activeTab} found
            </h3>
            <p className="text-white/70">
              {searchQuery 
                ? `No results for "${searchQuery}". Try different keywords.`
                : `Discover amazing ${activeTab} from verified users.`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}