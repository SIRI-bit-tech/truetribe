'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Conversation, User } from '@/types'
import TrustBadge from '@/components/ui/TrustBadge'
import VerificationBadges from '@/components/ui/VerificationBadges'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { formatTimeAgo } from '@/lib/utils'
import { messagingAPI } from '@/lib/api'

interface ConversationListProps {
  selectedConversationId?: string
  onSelectConversation: (conversation: Conversation) => void
  currentUser: User
}

export default function ConversationList({ 
  selectedConversationId, 
  onSelectConversation, 
  currentUser 
}: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadConversations()
  }, [])

  const loadConversations = async () => {
    try {
      const response = await messagingAPI.getConversations()
      setConversations(response.data.results || [])
    } catch (error) {
      console.error('Error loading conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredConversations = conversations.filter(conversation => {
    const otherUser = conversation.participants.find(p => p.id !== currentUser.id)
    if (!otherUser) return false
    
    const searchLower = searchQuery.toLowerCase()
    return (
      otherUser.full_name.toLowerCase().includes(searchLower) ||
      otherUser.username.toLowerCase().includes(searchLower) ||
      conversation.last_message.content.toLowerCase().includes(searchLower)
    )
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <h2 className="text-xl font-bold text-white mb-4">Messages</h2>
        
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
          />
          <svg className="absolute left-3 top-2.5 w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length > 0 ? (
          <div className="space-y-1">
            {filteredConversations.map((conversation, index) => {
              const otherUser = conversation.participants.find(p => p.id !== currentUser.id)
              if (!otherUser) return null

              const isSelected = conversation.id === selectedConversationId
              const hasUnread = conversation.unread_count > 0

              return (
                <motion.button
                  key={conversation.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  onClick={() => onSelectConversation(conversation)}
                  className={`w-full p-4 text-left hover:bg-white/5 transition-colors ${
                    isSelected ? 'bg-primary-blue/20 border-r-2 border-primary-blue' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Avatar */}
                    <div className="relative">
                      <Image
                        src={otherUser.avatar || '/default-avatar.png'}
                        alt={otherUser.username}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                      
                      {/* Online Status */}
                      {otherUser.is_online && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-trust-green rounded-full border-2 border-gray-900" />
                      )}
                      
                      {/* Verification Badge */}
                      {otherUser.id_verified && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-trust-green rounded-full flex items-center justify-center border-2 border-gray-900">
                          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <h3 className={`font-semibold truncate ${
                            hasUnread ? 'text-white' : 'text-white/90'
                          }`}>
                            {otherUser.full_name}
                          </h3>
                          <VerificationBadges user={otherUser} size="sm" maxVisible={1} />
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <TrustBadge score={otherUser.trust_score} size="sm" />
                          {hasUnread && (
                            <div className="w-5 h-5 bg-primary-blue rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">
                                {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <p className={`text-sm truncate ${
                          hasUnread ? 'text-white/90 font-medium' : 'text-white/60'
                        }`}>
                          {conversation.last_message.sender.id === currentUser.id && 'You: '}
                          {conversation.last_message.message_type === 'text' 
                            ? conversation.last_message.content
                            : `📎 ${conversation.last_message.message_type}`
                          }
                        </p>
                        
                        <span className="text-xs text-white/50 ml-2 flex-shrink-0">
                          {formatTimeAgo(conversation.updated_at)}
                        </span>
                      </div>

                      {/* Trust Verification Notice */}
                      {conversation.last_message.trust_verified && (
                        <div className="flex items-center space-x-1 mt-1">
                          <div className="w-3 h-3 bg-trust-green rounded-full flex items-center justify-center">
                            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span className="text-xs text-trust-green">Trust Verified</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.button>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchQuery ? 'No conversations found' : 'No messages yet'}
            </h3>
            <p className="text-white/60 text-center text-sm">
              {searchQuery 
                ? 'Try adjusting your search terms'
                : 'Start a conversation with verified users to see messages here'
              }
            </p>
          </div>
        )}
      </div>

      {/* Trust Notice */}
      <div className="p-4 border-t border-white/10">
        <div className="bg-trust-green/20 border border-trust-green/50 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-trust-green rounded-full flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-xs text-white/90">
              <span className="font-semibold text-trust-green">Secure Messaging:</span> Only verified users can message each other
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}