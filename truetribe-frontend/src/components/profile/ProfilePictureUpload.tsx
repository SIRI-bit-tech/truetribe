'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { usersAPI } from '@/lib/api'

interface ProfilePictureUploadProps {
  currentAvatar?: string
  username: string
  onAvatarUpdate: (newAvatarUrl: string) => void
}

export default function ProfilePictureUpload({ currentAvatar, username, onAvatarUpdate }: ProfilePictureUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [uploadMessage, setUploadMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      // Check file size (10MB limit)
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        alert('File size must be less than 10MB. Please choose a smaller image.')
        return
      }
      
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string)
        setShowUploadModal(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setUploadStatus('uploading')
    setUploadMessage('')
    
    // Add timeout to prevent infinite loading
    const uploadTimeout = setTimeout(() => {
      setIsUploading(false)
      setUploadStatus('error')
      setUploadMessage('Upload timed out. Please try again.')
    }, 30000) // 30 second timeout

    try {
      const formData = new FormData()
      formData.append('profile_picture', selectedFile)
      
      console.log('Uploading file:', selectedFile.name, 'Size:', selectedFile.size, 'Type:', selectedFile.type)
      console.log('FormData entries:', Array.from(formData.entries()))

      const response = await usersAPI.updateProfile(formData)
      console.log('Upload response:', response)
      
      clearTimeout(uploadTimeout)
      
      // Check if the response has the expected structure
      if (response && response.data && response.data.avatar) {
        setUploadStatus('success')
        setTimeout(() => {
          onAvatarUpdate(response.data.avatar)
          setShowUploadModal(false)
          setSelectedFile(null)
          setPreviewUrl('')
          setUploadStatus('idle')
          if (fileInputRef.current) {
            fileInputRef.current.value = ''
          }
        }, 1500)
      } else {
        // If no avatar in response, show error
        setUploadStatus('error')
        setUploadMessage('Upload completed but no avatar URL received. Please refresh the page.')
      }
      
    } catch (error) {
      clearTimeout(uploadTimeout)
      console.error('Error uploading profile picture:', error)
      
      // More specific error handling
      let errorMessage = 'Failed to upload profile picture. Please try again.'
      
      if (error && typeof error === 'object' && 'response' in error) {
        const response = error.response as { status?: number; data?: { profile_picture?: string[] } }
        if (response?.status === 413) {
          errorMessage = 'File too large. Please choose a smaller image.'
        } else if (response?.status === 415) {
          errorMessage = 'Unsupported file type. Please use JPG, PNG, or GIF.'
        } else if (response?.status === 400) {
          // Check for specific validation errors from backend
          if (response.data && response.data.profile_picture) {
            errorMessage = response.data.profile_picture[0] || 'Invalid profile picture. Please check file size and format.'
          } else {
            errorMessage = 'Invalid request. Please check your file and try again.'
          }
        } else if (response?.status === 401) {
          errorMessage = 'Please log in again to upload your profile picture.'
        } else if (response?.status && response.status >= 500) {
          errorMessage = 'Server error. Please try again later.'
        }
      }
      
      setUploadStatus('error')
      setUploadMessage(errorMessage)
    } finally {
      setIsUploading(false)
    }
  }

  const handleCancel = () => {
    setShowUploadModal(false)
    setSelectedFile(null)
    setPreviewUrl('')
    setUploadStatus('idle')
    setUploadMessage('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <>
      {/* Profile Picture with Upload Overlay */}
      <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white/20">
          <Image
            src={currentAvatar || '/default-avatar.svg'}
            alt={username}
            width={160}
            height={160}
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Upload Overlay */}
        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="text-center text-white">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm font-medium">Change Photo</p>
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={handleCancel}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-white mb-2">Update Profile Picture</h3>
                <p className="text-white/70">Preview your new profile picture</p>
              </div>

              {/* Image Preview */}
              <div className="mb-6">
                <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-white/20">
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={isUploading || uploadStatus === 'uploading'}
                  className="flex-1 px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading || uploadStatus === 'uploading' ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Uploading...</span>
                    </div>
                  ) : (
                    'Upload'
                  )}
                </button>
              </div>

              {/* Upload Status */}
              {uploadStatus === 'success' && (
                <div className="mt-4 p-3 bg-trust-green/20 border border-trust-green/50 rounded-lg">
                  <p className="text-trust-green text-sm text-center">Profile picture updated successfully!</p>
                </div>
              )}
              
              {uploadStatus === 'error' && (
                <div className="mt-4 p-3 bg-trust-red/20 border border-trust-red/50 rounded-lg">
                  <p className="text-trust-red text-sm text-center">{uploadMessage}</p>
                </div>
              )}

              {/* Upload Tips */}
              <div className="mt-4 text-center">
                <p className="text-white/50 text-sm">
                  Recommended: Square image, at least 400x400 pixels
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
