'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Message, User, Conversation } from '@/types'
import TrustBadge from '@/components/ui/TrustBadge'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { formatTimeAgo } from '@/lib/utils'
import { messagingAPI } from '@/lib/api'

interface ChatWindowProps {
  conversation: Conversation
  currentUser: User
  onBack?: () => void
}

export default function ChatWindow({ conversation, currentUser, onBack }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [typing, setTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const otherUser = conversation.participants.find(p => p.id !== currentUser.id)

  useEffect(() => {
    loadMessages()
  }, [conversation.id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadMessages = async () => {
    try {
      const response = await messagingAPI.getMessages(conversation.id)
      setMessages(response.data.results || [])
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || sending) return

    const messageContent = newMessage.trim()
    setNewMessage('')
    setSending(true)

    try {
      const response = await messagingAPI.sendMessage(conversation.id, {
        content: messageContent,
        message_type: 'text'
      })
      
      setMessages(prev => [...prev, response.data])
    } catch (error) {
      console.error('Error sending message:', error)
      setNewMessage(messageContent) // Restore message on error
    } finally {
      setSending(false)
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!file) return

    setSending(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('message_type', file.type.startsWith('image/') ? 'image' : 'file')

      const response = await messagingAPI.sendMessage(conversation.id, formData)
      setMessages(prev => [...prev, response.data])
    } catch (error) {
      console.error('Error sending file:', error)
    } finally {
      setSending(false)
    }
  }

  if (!otherUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-white/60">Invalid conversation</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10 glass-dark">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {onBack && (
              <button
                onClick={onBack}
                className="md:hidden text-white/60 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            
            <div className="relative">
              <Image
                src={otherUser.avatar || '/default-avatar.png'}
                alt={otherUser.username}
                width={40}
                height={40}
                className="rounded-full"
              />
              {otherUser.is_online && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-trust-green rounded-full border-2 border-gray-900" />
              )}
            </div>
            
            <div>
              <h3 className="font-semibold text-white">{otherUser.full_name}</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-white/60">@{otherUser.username}</span>
                <TrustBadge score={otherUser.trust_score} size="sm" />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <button className="p-2 text-white/60 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </button>
            <button className="p-2 text-white/60 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : messages.length > 0 ? (
          <AnimatePresence>
            {messages.map((message, index) => {
              const isOwn = message.sender.id === currentUser.id
              const showAvatar = index === 0 || messages[index - 1].sender.id !== message.sender.id
              const showTime = index === messages.length - 1 || 
                messages[index + 1].sender.id !== message.sender.id ||
                new Date(messages[index + 1].created_at).getTime() - new Date(message.created_at).getTime() > 300000 // 5 minutes

              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    {/* Avatar */}
                    {showAvatar && !isOwn && (
                      <Image
                        src={message.sender.avatar || '/default-avatar.png'}
                        alt={message.sender.username}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    )}
                    {!showAvatar && !isOwn && <div className="w-8" />}

                    {/* Message Bubble */}
                    <div className={`relative px-4 py-2 rounded-2xl ${
                      isOwn 
                        ? 'bg-primary-blue text-white' 
                        : 'glass text-white'
                    }`}>
                      {/* Trust Verification Badge */}
                      {message.trust_verified && (
                        <div className="absolute -top-2 -right-2 w-5 h-5 bg-trust-green rounded-full flex items-center justify-center border-2 border-gray-900">
                          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}

                      {/* Message Content */}
                      {message.message_type === 'text' ? (
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      ) : message.message_type === 'image' ? (
                        <div className="space-y-2">
                          <Image
                            src={message.media_url!}
                            alt="Shared image"
                            width={200}
                            height={200}
                            className="rounded-lg max-w-full h-auto"
                          />
                          {message.content && (
                            <p className="text-sm">{message.content}</p>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                          <span className="text-sm">{message.content || 'File attachment'}</span>
                        </div>
                      )}

                      {/* Message Time */}
                      {showTime && (
                        <div className={`text-xs mt-1 ${isOwn ? 'text-white/70' : 'text-white/50'}`}>
                          {formatTimeAgo(message.created_at)}
                          {message.is_read && isOwn && (
                            <span className="ml-2">✓✓</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-6xl mb-4">👋</div>
            <h3 className="text-xl font-semibold text-white mb-2">Start the conversation</h3>
            <p className="text-white/60 text-center">
              Send a message to {otherUser.full_name} to begin your secure, verified conversation.
            </p>
          </div>
        )}

        {/* Typing Indicator */}
        {typing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-2"
          >
            <Image
              src={otherUser.avatar || '/default-avatar.png'}
              alt={otherUser.username}
              width={24}
              height={24}
              className="rounded-full"
            />
            <div className="glass rounded-full px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-white/10 glass-dark">
        <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
          {/* File Upload */}
          <label className="cursor-pointer text-white/60 hover:text-primary-blue transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            <input
              type="file"
              className="hidden"
              accept="image/*,video/*,.pdf,.doc,.docx"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFileUpload(file)
              }}
            />
          </label>

          {/* Message Input */}
          <div className="flex-1">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-full text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
              disabled={sending}
            />
          </div>

          {/* Send Button */}
          <Button
            type="submit"
            loading={sending}
            disabled={!newMessage.trim() || sending}
            className="rounded-full p-3"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </Button>
        </form>

        {/* Trust Notice */}
        <div className="mt-3 bg-trust-green/20 border border-trust-green/50 rounded-lg p-2">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-trust-green rounded-full flex items-center justify-center">
              <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-xs text-white/90">
              <span className="font-semibold text-trust-green">Encrypted & Verified:</span> Messages are secure and scam-protected
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}