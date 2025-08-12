'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User } from '@/types'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { verificationAPI } from '@/lib/api'

interface VerificationFlowProps {
  user: User
  onComplete: () => void
}

export default function VerificationFlow({ user, onComplete }: VerificationFlowProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [idDocument, setIdDocument] = useState<File | null>(null)
  const [selfiePhoto, setSelfiePhoto] = useState<File | null>(null)
  const [verificationData, setVerificationData] = useState({
    documentType: 'passport',
    documentNumber: '',
    fullName: user.full_name,
    dateOfBirth: '',
    address: ''
  })

  const steps = [
    { id: 1, title: 'Document Upload', description: 'Upload your government-issued ID' },
    { id: 2, title: 'Face Verification', description: 'Take a selfie for biometric matching' },
    { id: 3, title: 'Personal Details', description: 'Confirm your information' },
    { id: 4, title: 'Review & Submit', description: 'Review and submit for verification' }
  ]

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setIdDocument(file)
    }
  }

  const handleSelfieUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelfiePhoto(file)
    }
  }

  const handleSubmitVerification = async () => {
    if (!idDocument || !selfiePhoto) return

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('id_document', idDocument)
      formData.append('selfie_photo', selfiePhoto)
      formData.append('document_type', verificationData.documentType)
      formData.append('document_number', verificationData.documentNumber)
      formData.append('full_name', verificationData.fullName)
      formData.append('date_of_birth', verificationData.dateOfBirth)
      formData.append('address', verificationData.address)

      await verificationAPI.submitVerification(formData)
      onComplete()
    } catch (error) {
      console.error('Error submitting verification:', error)
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                currentStep >= step.id 
                  ? 'bg-trust-green text-white' 
                  : 'bg-white/20 text-white/60'
              }`}>
                {currentStep > step.id ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  step.id
                )}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-1 mx-2 ${
                  currentStep > step.id ? 'bg-trust-green' : 'bg-white/20'
                }`} />
              )}
            </div>
          ))}
        </div>
        
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            {steps[currentStep - 1].title}
          </h2>
          <p className="text-white/70">
            {steps[currentStep - 1].description}
          </p>
        </div>
      </div>

      {/* Step Content */}
      <div className="glass rounded-2xl p-8">
        <AnimatePresence mode="wait">
          {/* Step 1: Document Upload */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-white/90 mb-3">
                  Document Type
                </label>
                <select
                  value={verificationData.documentType}
                  onChange={(e) => setVerificationData(prev => ({ ...prev, documentType: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-trust-green focus:border-transparent transition-all"
                >
                  <option value="passport" className="bg-gray-800">Passport</option>
                  <option value="drivers_license" className="bg-gray-800">Driver's License</option>
                  <option value="national_id" className="bg-gray-800">National ID Card</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-3">
                  Upload Document Photo
                </label>
                <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-trust-green/50 transition-colors">
                  {idDocument ? (
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-trust-green rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="text-white font-medium">{idDocument.name}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIdDocument(null)}
                        className="text-white/70 border border-white/20"
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-8 h-8 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-white mb-2">Click to upload or drag and drop</p>
                        <p className="text-white/60 text-sm">PNG, JPG up to 10MB</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleDocumentUpload}
                        className="hidden"
                        id="document-upload"
                      />
                      <label htmlFor="document-upload">
                        <Button as="span" className="cursor-pointer">
                          Choose File
                        </Button>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-primary-blue/20 border border-primary-blue/50 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary-blue rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Document Requirements</h4>
                    <ul className="text-white/80 text-sm space-y-1">
                      <li>• Document must be clear and readable</li>
                      <li>• All corners must be visible</li>
                      <li>• No glare or shadows</li>
                      <li>• Document must be current and valid</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Face Verification */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-white/90 mb-3">
                  Take a Selfie
                </label>
                <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-trust-green/50 transition-colors">
                  {selfiePhoto ? (
                    <div className="space-y-4">
                      <img
                        src={URL.createObjectURL(selfiePhoto)}
                        alt="Selfie preview"
                        className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-trust-green"
                      />
                      <p className="text-white font-medium">Selfie captured successfully</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelfiePhoto(null)}
                        className="text-white/70 border border-white/20"
                      >
                        Retake
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-12 h-12 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-white mb-2">Take a clear selfie photo</p>
                        <p className="text-white/60 text-sm">Make sure your face is clearly visible</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        capture="user"
                        onChange={handleSelfieUpload}
                        className="hidden"
                        id="selfie-upload"
                      />
                      <label htmlFor="selfie-upload">
                        <Button as="span" className="cursor-pointer">
                          Take Selfie
                        </Button>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-trust-green/20 border border-trust-green/50 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-trust-green rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Selfie Guidelines</h4>
                    <ul className="text-white/80 text-sm space-y-1">
                      <li>• Look directly at the camera</li>
                      <li>• Ensure good lighting on your face</li>
                      <li>• Remove glasses and hats</li>
                      <li>• Keep a neutral expression</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Personal Details */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    Document Number
                  </label>
                  <input
                    type="text"
                    value={verificationData.documentNumber}
                    onChange={(e) => setVerificationData(prev => ({ ...prev, documentNumber: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-trust-green focus:border-transparent transition-all"
                    placeholder="Enter document number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={verificationData.dateOfBirth}
                    onChange={(e) => setVerificationData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-trust-green focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Full Name (as on document)
                </label>
                <input
                  type="text"
                  value={verificationData.fullName}
                  onChange={(e) => setVerificationData(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-trust-green focus:border-transparent transition-all"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Address
                </label>
                <textarea
                  value={verificationData.address}
                  onChange={(e) => setVerificationData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-trust-green focus:border-transparent transition-all resize-none"
                  placeholder="Enter your address"
                  rows={3}
                />
              </div>
            </motion.div>
          )}

          {/* Step 4: Review & Submit */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-white mb-2">Review Your Information</h3>
                <p className="text-white/70">Please verify all details before submitting</p>
              </div>

              <div className="space-y-4">
                <div className="glass rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-3">Documents</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-white/70 text-sm mb-1">ID Document</p>
                      <p className="text-white">{idDocument?.name}</p>
                    </div>
                    <div>
                      <p className="text-white/70 text-sm mb-1">Selfie Photo</p>
                      <p className="text-white">{selfiePhoto?.name}</p>
                    </div>
                  </div>
                </div>

                <div className="glass rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-3">Personal Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-white/70 text-sm mb-1">Full Name</p>
                      <p className="text-white">{verificationData.fullName}</p>
                    </div>
                    <div>
                      <p className="text-white/70 text-sm mb-1">Document Type</p>
                      <p className="text-white capitalize">{verificationData.documentType.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <p className="text-white/70 text-sm mb-1">Document Number</p>
                      <p className="text-white">{verificationData.documentNumber}</p>
                    </div>
                    <div>
                      <p className="text-white/70 text-sm mb-1">Date of Birth</p>
                      <p className="text-white">{verificationData.dateOfBirth}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-white/70 text-sm mb-1">Address</p>
                    <p className="text-white">{verificationData.address}</p>
                  </div>
                </div>
              </div>

              <div className="bg-trust-green/20 border border-trust-green/50 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-trust-green rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-trust-green font-semibold mb-1">Verification Process</h4>
                    <p className="text-white/80 text-sm">
                      Your documents will be reviewed by our verification team within 24-48 hours. 
                      You'll receive an email notification once the review is complete.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="ghost"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="text-white border border-white/20"
          >
            Previous
          </Button>

          {currentStep < steps.length ? (
            <Button
              onClick={nextStep}
              disabled={
                (currentStep === 1 && !idDocument) ||
                (currentStep === 2 && !selfiePhoto) ||
                (currentStep === 3 && (!verificationData.documentNumber || !verificationData.dateOfBirth || !verificationData.fullName || !verificationData.address))
              }
              variant="trust"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmitVerification}
              loading={loading}
              disabled={loading}
              variant="trust"
            >
              Submit for Verification
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}