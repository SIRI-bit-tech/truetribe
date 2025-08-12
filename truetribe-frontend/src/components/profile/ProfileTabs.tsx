'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ProfileTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const tabs = [
  { id: 'posts', label: 'Posts', icon: '📝' },
  { id: 'videos', label: 'Videos', icon: '🎥' },
  { id: 'live', label: 'Live', icon: '🔴' },
  { id: 'tagged', label: 'Tagged', icon: '🏷️' }
]

export default function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
  return (
    <div className="glass rounded-2xl p-2 mb-6">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl transition-all duration-200',
              activeTab === tab.id
                ? 'bg-primary-blue text-white'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            )}
          >
            <span className="text-lg">{tab.icon}</span>
            <span className="font-medium hidden sm:block">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}