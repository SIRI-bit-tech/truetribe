'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Conversation, User } from '@/types'
import ConversationList from '@/components/messaging/ConversationList'
import ChatWindow from '@/components/messaging/ChatWindow'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Button from '@/components/ui/Button'
import { usersAPI } from '@/lib/api'

export default function MessagesPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [loading, setLoading] = useState(true)
  const [showMobileChat, setShowMobileChat] = useState(false)

  useEffect(() => {
    loadCurrentUser()
  }, [])

  const loadCurrentUser = async () => {
    try {
      const response = await usersAPI.getProfile()
      setCurrentUser(response.data)
    } catch (error) {
      console.error('Error loading user:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation)
    setShowMobileChat(true)
  }

  const handleBackToList = () => {
    setShowMobileChat(false)
    setSelectedConversation(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-white mb-4">Authentication Required</h2>
          <p className="text-white/70 mb-6">Please log in to access your messages</p>
          <Button>Sign In</Button>
        </div>
      </div>
    )
  }

  // Verification check
  if (!currentUser.id_verified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="glass rounded-2xl p-12 max-w-2xl mx-auto">
              <div className="text-8xl mb-6">🛡️</div>
              <h1 className="text-4xl font-bold text-white mb-6">Verification Required</h1>
              <p className="text-xl text-white/80 mb-8 leading-relaxed">
                TrueTribe messaging is exclusively for verified users to ensure secure, 
                scam-free communication. Complete your verification to unlock messaging.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-center space-x-3 text-white/70">
                  <div className="w-6 h-6 bg-trust-green rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span>End-to-end encrypted messaging</span>
                </div>
                <div className="flex items-center justify-center space-x-3 text-white/70">
                  <div className="w-6 h-6 bg-trust-green rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span>AI-powered scam detection</span>
                </div>
                <div className="flex items-center justify-center space-x-3 text-white/70">
                  <div className="w-6 h-6 bg-trust-green rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span>Verified users only</span>
                </div>
              </div>

              <div className="space-y-4">
                <Button size="lg" variant="trust" className="px-12">
                  Start Verification Process
                </Button>
                <div>
                  <Button variant="ghost" size="lg" className="text-white border border-white/20">
                    Learn More About Verification
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="h-full max-w-7xl mx-auto">
        <div className="h-full flex">
          {/* Conversations List - Desktop always visible, Mobile conditional */}
          <div className={`w-full md:w-1/3 lg:w-1/4 border-r border-white/10 ${
            showMobileChat ? 'hidden md:block' : 'block'
          }`}>
            <ConversationList
              selectedConversationId={selectedConversation?.id}
              onSelectConversation={handleSelectConversation}
              currentUser={currentUser}
            />
          </div>

          {/* Chat Window - Desktop always visible, Mobile conditional */}
          <div className={`flex-1 ${
            showMobileChat ? 'block' : 'hidden md:block'
          }`}>
            {selectedConversation ? (
              <ChatWindow
                conversation={selectedConversation}
                currentUser={currentUser}
                onBack={handleBackToList}
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center max-w-md mx-auto px-6"
                >
                  <div className="text-8xl mb-6">💬</div>
                  <h2 className="text-3xl font-bold text-white mb-4">
                    Secure Messaging
                  </h2>
                  <p className="text-white/70 text-lg mb-8 leading-relaxed">
                    Select a conversation to start messaging with verified users. 
                    All messages are encrypted and scam-protected.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="glass rounded-xl p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-trust-green rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="text-left">
                          <h4 className="text-white font-semibold">Trust Verified</h4>
                          <p className="text-white/60 text-sm">Only verified users can message</p>
                        </div>
                      </div>
                    </div>

                    <div className="glass rounded-xl p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary-blue rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="text-left">
                          <h4 className="text-white font-semibold">End-to-End Encrypted</h4>
                          <p className="text-white/60 text-sm">Your messages are completely private</p>
                        </div>
                      </div>
                    </div>

                    <div className="glass rounded-xl p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-trust-red rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="text-left">
                          <h4 className="text-white font-semibold">Scam Protected</h4>
                          <p className="text-white/60 text-sm">AI detects and prevents scams</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}