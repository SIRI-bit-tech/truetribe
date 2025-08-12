'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Verification } from '@/types'
import VerificationFlow from '@/components/verification/VerificationFlow'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Button from '@/components/ui/Button'
import TrustBadge from '@/components/ui/TrustBadge'
import VerificationBadges from '@/components/ui/VerificationBadges'
import { usersAPI, verificationAPI } from '@/lib/api'

export default function VerificationPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [verificationStatus, setVerificationStatus] = useState<Verification[]>([])
  const [loading, setLoading] = useState(true)
  const [showVerificationFlow, setShowVerificationFlow] = useState(false)

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const [userResponse, verificationResponse] = await Promise.all([
        usersAPI.getProfile(),
        verificationAPI.getVerificationStatus()
      ])
      
      setCurrentUser(userResponse.data)
      setVerificationStatus(verificationResponse.data.results || [])
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerificationComplete = () => {
    setShowVerificationFlow(false)
    loadUserData() // Refresh data
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
          <p className="text-white/70 mb-6">Please log in to access verification</p>
          <Button>Sign In</Button>
        </div>
      </div>
    )
  }

  if (showVerificationFlow) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <VerificationFlow
            user={currentUser}
            onComplete={handleVerificationComplete}
          />
        </div>
      </div>
    )
  }

  const pendingVerifications = verificationStatus.filter(v => v.status === 'pending')
  const approvedVerifications = verificationStatus.filter(v => v.status === 'approved')
  const rejectedVerifications = verificationStatus.filter(v => v.status === 'rejected')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            🛡️ Account Verification
          </h1>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Build trust and unlock all TrueTribe features through our comprehensive verification system
          </p>
        </motion.div>

        {/* Current Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-8 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Your Verification Status</h2>
            <TrustBadge score={currentUser.trust_score} size="lg" showLevel />
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* User Info */}
            <div className="flex items-center space-x-4">
              <img
                src={currentUser.avatar || '/default-avatar.png'}
                alt={currentUser.username}
                className="w-20 h-20 rounded-full border-4 border-white/20"
              />
              <div>
                <h3 className="text-xl font-semibold text-white">{currentUser.full_name}</h3>
                <p className="text-white/70">@{currentUser.username}</p>
                <div className="mt-2">
                  <VerificationBadges user={currentUser} size="md" maxVisible={5} />
                </div>
              </div>
            </div>

            {/* Verification Progress */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white/80">ID Verification</span>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  currentUser.id_verified 
                    ? 'bg-trust-green/20 text-trust-green' 
                    : 'bg-white/10 text-white/60'
                }`}>
                  {currentUser.id_verified ? 'Verified' : 'Not Verified'}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-white/80">Face Verification</span>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  currentUser.face_verified 
                    ? 'bg-trust-green/20 text-trust-green' 
                    : 'bg-white/10 text-white/60'
                }`}>
                  {currentUser.face_verified ? 'Verified' : 'Not Verified'}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-white/80">Education Verification</span>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  currentUser.education_verified 
                    ? 'bg-trust-green/20 text-trust-green' 
                    : 'bg-white/10 text-white/60'
                }`}>
                  {currentUser.education_verified ? 'Verified' : 'Not Verified'}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-white/80">Professional Verification</span>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  currentUser.profession_verified 
                    ? 'bg-trust-green/20 text-trust-green' 
                    : 'bg-white/10 text-white/60'
                }`}>
                  {currentUser.profession_verified ? 'Verified' : 'Not Verified'}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-white/80">Location Verification</span>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  currentUser.location_verified 
                    ? 'bg-trust-green/20 text-trust-green' 
                    : 'bg-white/10 text-white/60'
                }`}>
                  {currentUser.location_verified ? 'Verified' : 'Not Verified'}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Verification Types */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* ID + Face Verification */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-6"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-trust-green to-primary-blue rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🆔</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">ID + Face Verification</h3>
              <p className="text-white/70 text-sm">
                Essential verification required for all TrueTribe features
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-2 text-white/80 text-sm">
                <svg className="w-4 h-4 text-trust-green" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Access to messaging</span>
              </div>
              <div className="flex items-center space-x-2 text-white/80 text-sm">
                <svg className="w-4 h-4 text-trust-green" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Live streaming capability</span>
              </div>
              <div className="flex items-center space-x-2 text-white/80 text-sm">
                <svg className="w-4 h-4 text-trust-green" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Higher trust score</span>
              </div>
              <div className="flex items-center space-x-2 text-white/80 text-sm">
                <svg className="w-4 h-4 text-trust-green" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Verification badge</span>
              </div>
            </div>

            {currentUser.id_verified && currentUser.face_verified ? (
              <div className="text-center">
                <div className="w-12 h-12 bg-trust-green rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-trust-green font-semibold">Verified</p>
              </div>
            ) : pendingVerifications.some(v => v.verification_type === 'id' || v.verification_type === 'face') ? (
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-yellow rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
                <p className="text-primary-yellow font-semibold">Under Review</p>
                <p className="text-white/60 text-sm mt-1">24-48 hours</p>
              </div>
            ) : (
              <Button
                onClick={() => setShowVerificationFlow(true)}
                variant="trust"
                className="w-full"
              >
                Start Verification
              </Button>
            )}
          </motion.div>

          {/* Education Verification */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-2xl p-6"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-primary-purple to-primary-blue rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎓</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Education Verification</h3>
              <p className="text-white/70 text-sm">
                Verify your educational background and qualifications
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-2 text-white/80 text-sm">
                <svg className="w-4 h-4 text-trust-green" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Education expertise badge</span>
              </div>
              <div className="flex items-center space-x-2 text-white/80 text-sm">
                <svg className="w-4 h-4 text-trust-green" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Academic credibility</span>
              </div>
              <div className="flex items-center space-x-2 text-white/80 text-sm">
                <svg className="w-4 h-4 text-trust-green" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Educational content priority</span>
              </div>
            </div>

            <Button
              variant="secondary"
              className="w-full"
              disabled={!currentUser.id_verified}
            >
              {currentUser.education_verified ? 'Verified' : 'Coming Soon'}
            </Button>
          </motion.div>

          {/* Professional Verification */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass rounded-2xl p-6"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-primary-orange to-primary-pink rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💼</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Professional Verification</h3>
              <p className="text-white/70 text-sm">
                Verify your professional experience and expertise
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-2 text-white/80 text-sm">
                <svg className="w-4 h-4 text-trust-green" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Professional badge</span>
              </div>
              <div className="flex items-center space-x-2 text-white/80 text-sm">
                <svg className="w-4 h-4 text-trust-green" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Industry expertise</span>
              </div>
              <div className="flex items-center space-x-2 text-white/80 text-sm">
                <svg className="w-4 h-4 text-trust-green" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Business networking</span>
              </div>
            </div>

            <Button
              variant="secondary"
              className="w-full"
              disabled={!currentUser.id_verified}
            >
              {currentUser.profession_verified ? 'Verified' : 'Coming Soon'}
            </Button>
          </motion.div>
        </div>

        {/* Verification History */}
        {verificationStatus.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass rounded-2xl p-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Verification History</h2>
            
            <div className="space-y-4">
              {verificationStatus.map((verification, index) => (
                <div key={verification.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      verification.status === 'approved' ? 'bg-trust-green' :
                      verification.status === 'pending' ? 'bg-primary-yellow' :
                      'bg-trust-red'
                    }`}>
                      {verification.status === 'approved' ? (
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : verification.status === 'pending' ? (
                        <svg className="w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    
                    <div>
                      <h4 className="text-white font-semibold capitalize">
                        {verification.verification_type.replace('_', ' ')} Verification
                      </h4>
                      <p className="text-white/60 text-sm">
                        Submitted {new Date(verification.submitted_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                      verification.status === 'approved' ? 'bg-trust-green/20 text-trust-green' :
                      verification.status === 'pending' ? 'bg-primary-yellow/20 text-primary-yellow' :
                      'bg-trust-red/20 text-trust-red'
                    }`}>
                      {verification.status}
                    </div>
                    {verification.reviewer_notes && (
                      <p className="text-white/60 text-xs mt-1 max-w-xs">
                        {verification.reviewer_notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Trust Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <h2 className="text-3xl font-bold text-white mb-8">Why Verify Your Account?</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass rounded-xl p-6">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-xl font-semibold text-white mb-2">Build Trust</h3>
              <p className="text-white/70">
                Verified accounts have higher trust scores and are prioritized in feeds and search results.
              </p>
            </div>
            
            <div className="glass rounded-xl p-6">
              <div className="text-4xl mb-4">🔓</div>
              <h3 className="text-xl font-semibold text-white mb-2">Unlock Features</h3>
              <p className="text-white/70">
                Access messaging, live streaming, and other premium features exclusive to verified users.
              </p>
            </div>
            
            <div className="glass rounded-xl p-6">
              <div className="text-4xl mb-4">🚫</div>
              <h3 className="text-xl font-semibold text-white mb-2">Prevent Scams</h3>
              <p className="text-white/70">
                Help create a safer community by proving your identity and preventing impersonation.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}