import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTrustScore(score: number): string {
  return (score * 100).toFixed(1)
}

export function getTrustScoreColor(score: number): string {
  if (score >= 0.8) return 'text-trust-green'
  if (score >= 0.6) return 'text-primary-yellow'
  if (score >= 0.4) return 'text-primary-orange'
  return 'text-trust-red'
}

export function formatTimeAgo(date: string | Date): string {
  const now = new Date()
  const past = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000)

  if (diffInSeconds < 60) return 'now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`
  return `${Math.floor(diffInSeconds / 604800)}w`
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function generateVerificationBadges(user: any): string[] {
  const badges = []
  if (user.id_verified) badges.push('ID Verified')
  if (user.face_verified) badges.push('Face Verified')
  if (user.education_verified) badges.push('Education')
  if (user.profession_verified) badges.push('Professional')
  if (user.location_verified) badges.push('Location')
  return badges
}

export function calculateTrustLevel(score: number): string {
  if (score >= 0.9) return 'Exceptional'
  if (score >= 0.8) return 'Highly Trusted'
  if (score >= 0.7) return 'Trusted'
  if (score >= 0.6) return 'Reliable'
  if (score >= 0.5) return 'Moderate'
  if (score >= 0.4) return 'Developing'
  return 'New User'
}