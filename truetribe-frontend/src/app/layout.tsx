'use client'

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { useEffect, useState } from 'react'
import './globals.css'
import Header from '@/components/layout/Header'
import BottomNavigation from '@/components/layout/BottomNavigation'
import { User } from '@/types'
import { usersAPI } from '@/lib/api'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('access_token')
        if (token) {
          const response = await usersAPI.getProfile()
          setUser(response.data)
        }
      } catch (error) {
        console.error('Error loading user:', error)
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
      }
    }

    loadUser()
  }, [])

  return (
    <html lang="en">
      <head>
        <title>TrueTribe - The World's First Truly Trustworthy Social Network</title>
        <meta name="description" content="Join TrueTribe, the revolutionary social platform that combines Instagram-style feeds with mandatory verification, trust scoring, and anti-scam protection. One person, one account - verified and trusted." />
        <meta name="keywords" content="social network, verified users, trust score, anti-scam, secure messaging, live streaming, video sharing" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <Header user={user} />
          <main className="pt-16 pb-20 md:pb-0">
            {children}
          </main>
          <BottomNavigation user={user} />
        </div>
      </body>
    </html>
  )
}