'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'
import { authAPI } from '@/lib/api'
import { validateEmail } from '@/lib/utils'

export default function RegisterForm() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    fullName: '',
    agreeToTerms: false,
    agreeToVerification: false
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.username) {
      newErrors.username = 'Username is required'
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores'
    }

    if (!formData.fullName) {
      newErrors.fullName = 'Full name is required'
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters'
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions'
    }

    if (!formData.agreeToVerification) {
      newErrors.agreeToVerification = 'You must agree to mandatory verification'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateStep2()) return

    setLoading(true)
    try {
      const response = await authAPI.register({
        email: formData.email,
        password: formData.password,
        username: formData.username,
        full_name: formData.fullName
      })
      
      // Store tokens and redirect on successful registration
      if (response.status === 201 && response.data.tokens) {
        localStorage.setItem('access_token', response.data.tokens.access)
        localStorage.setItem('refresh_token', response.data.tokens.refresh)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        
        // Redirect to feed (main homepage)
        router.push('/feed')
      } else {
        // Fallback to email verification if no tokens
        router.push('/auth/verify-email?email=' + encodeURIComponent(formData.email))
      }
    } catch (error: any) {
      if (error.response?.data?.email) {
        setErrors({ email: 'Email already exists' })
        setStep(1)
      } else if (error.response?.data?.username) {
        setErrors({ username: 'Username already taken' })
      } else if (error.response?.data?.detail) {
        setErrors({ general: error.response.data.detail })
      } else {
        setErrors({ general: 'Registration failed. Please try again.' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="glass rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-primary-blue to-primary-purple rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">T</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Join TrueTribe</h1>
            <p className="text-white/70">Create your verified account</p>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 1 ? 'bg-primary-blue text-white' : 'bg-white/20 text-white/50'
              }`}>
                1
              </div>
              <div className={`w-16 h-1 mx-2 ${step >= 2 ? 'bg-primary-blue' : 'bg-white/20'}`} />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 2 ? 'bg-primary-blue text-white' : 'bg-white/20 text-white/50'
              }`}>
                2
              </div>
            </div>
          </div>

          {/* Step 1: Account Details */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-trust-red">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
                    placeholder="Create a strong password"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-trust-red">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/90 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
                    placeholder="Confirm your password"
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-trust-red">{errors.confirmPassword}</p>
                  )}
                </div>

                <Button
                  type="button"
                  onClick={handleNext}
                  className="w-full py-3 text-lg"
                >
                  Continue
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Profile & Verification */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                {errors.general && (
                  <div className="bg-trust-red/20 border border-trust-red/50 rounded-lg p-3 text-trust-red text-sm">
                    {errors.general}
                  </div>
                )}

                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-white/90 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
                    placeholder="Choose a unique username"
                  />
                  {errors.username && (
                    <p className="mt-1 text-sm text-trust-red">{errors.username}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-white/90 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
                    placeholder="Enter your full name"
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-sm text-trust-red">{errors.fullName}</p>
                  )}
                </div>

                {/* Verification Agreement */}
                <div className="space-y-4">
                  <div className="p-4 bg-primary-blue/20 border border-primary-blue/50 rounded-lg">
                    <h3 className="text-white font-semibold mb-2">🛡️ Mandatory Verification Required</h3>
                    <p className="text-white/80 text-sm mb-3">
                      TrueTribe requires ID + Face verification for all users. This ensures one person = one account and prevents scams.
                    </p>
                    <label className="flex items-start">
                      <input
                        type="checkbox"
                        name="agreeToVerification"
                        checked={formData.agreeToVerification}
                        onChange={handleChange}
                        className="w-4 h-4 text-primary-blue bg-white/10 border-white/20 rounded focus:ring-primary-blue focus:ring-2 mt-0.5"
                      />
                      <span className="ml-3 text-sm text-white/90">
                        I agree to complete mandatory ID and face verification within 24 hours of registration
                      </span>
                    </label>
                    {errors.agreeToVerification && (
                      <p className="mt-1 text-sm text-trust-red">{errors.agreeToVerification}</p>
                    )}
                  </div>

                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleChange}
                      className="w-4 h-4 text-primary-blue bg-white/10 border-white/20 rounded focus:ring-primary-blue focus:ring-2 mt-0.5"
                    />
                    <span className="ml-3 text-sm text-white/90">
                      I agree to the{' '}
                      <Link href="/terms" className="text-primary-blue hover:text-blue-400 underline">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="text-primary-blue hover:text-blue-400 underline">
                        Privacy Policy
                      </Link>
                    </span>
                  </label>
                  {errors.agreeToTerms && (
                    <p className="mt-1 text-sm text-trust-red">{errors.agreeToTerms}</p>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 text-white border border-white/20"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    loading={loading}
                    className="flex-1 py-3"
                    disabled={loading}
                  >
                    Create Account
                  </Button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-white/70">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-primary-blue hover:text-blue-400 font-medium transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}