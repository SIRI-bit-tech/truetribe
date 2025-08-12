'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User } from '@/types'
import Button from '@/components/ui/Button'
import TrustBadge from '@/components/ui/TrustBadge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { usersAPI } from '@/lib/api'

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState('profile')
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    email: '',
    username: '',
    phone: '',
    website: '',
    location: ''
  })

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const response = await usersAPI.getProfile()
      setUser(response.data)
      setFormData({
        full_name: response.data.full_name,
        bio: response.data.bio || '',
        email: response.data.email,
        username: response.data.username,
        phone: '',
        website: '',
        location: ''
      })
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const sections = [
    { id: 'profile', title: 'Edit Profile', icon: '👤' },
    { id: 'account', title: 'Account', icon: '⚙️' },
    { id: 'privacy', title: 'Privacy & Security', icon: '🔒' },
    { id: 'notifications', title: 'Notifications', icon: '🔔' },
    { id: 'content', title: 'Content Preferences', icon: '📱' },
    { id: 'blocking', title: 'Blocking & Restrictions', icon: '🚫' },
    { id: 'verification', title: 'Verification', icon: '🛡️' },
    { id: 'trust', title: 'Trust & Safety', icon: '⭐' },
    { id: 'data', title: 'Your Data', icon: '📊' },
    { id: 'help', title: 'Help & Support', icon: '❓' }
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-white mb-4">Authentication Required</h2>
          <p className="text-white/70">Please log in to access settings</p>
        </div>
      </div>
    )
  }

  const ToggleSwitch = ({ checked = false, onChange }: { checked?: boolean, onChange?: (checked: boolean) => void }) => (
    <label className="relative inline-flex items-center cursor-pointer">
      <input 
        type="checkbox" 
        className="sr-only peer" 
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
      />
      <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-blue"></div>
    </label>
  )

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-6 mb-8">
        <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white/20">
          <img
            src={user.avatar || '/default-avatar.png'}
            alt={user.username}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <Button variant="primary" size="sm">Change Photo</Button>
          <Button variant="ghost" size="sm" className="ml-2 text-white/70">Remove</Button>
          <p className="text-white/60 text-sm mt-2">JPG, PNG up to 10MB</p>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">Full Name</label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/90 mb-2">Bio</label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all resize-none"
            rows={4}
            placeholder="Tell people about yourself..."
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">Phone Number</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
              placeholder="Optional"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">Website</label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
              placeholder="https://yourwebsite.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
              placeholder="City, Country"
            />
          </div>
        </div>

        <Button variant="primary" className="w-full">
          Save Changes
        </Button>
      </div>
    </div>
  )

  const renderAccountSettings = () => (
    <div className="space-y-6">
      <div className="glass rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Login & Security</h3>
        <div className="space-y-4">
          <Button variant="secondary" className="w-full justify-between">
            <span>Change Password</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
          <Button variant="secondary" className="w-full justify-between">
            <span>Two-Factor Authentication</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
          <Button variant="secondary" className="w-full justify-between">
            <span>Login Activity</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
          <Button variant="secondary" className="w-full justify-between">
            <span>Connected Apps</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
      </div>

      <div className="glass rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Account Information</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-white/80">Member Since</span>
            <span className="text-white">{new Date(user.created_at).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/80">Account Type</span>
            <span className="text-white">Personal</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/80">Trust Score</span>
            <TrustBadge score={user.trust_score} size="sm" />
          </div>
          <Button variant="secondary" className="w-full">Download Your Data</Button>
        </div>
      </div>

      <div className="glass rounded-lg p-6 border border-trust-red/50">
        <h3 className="text-lg font-semibold text-trust-red mb-4">Account Actions</h3>
        <div className="space-y-4">
          <Button variant="secondary" className="w-full">Temporarily Disable Account</Button>
          <Button variant="danger" className="w-full">Delete Account</Button>
        </div>
      </div>
    </div>
  )

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <div className="glass rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Account Privacy</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-white font-medium">Private Account</span>
              <p className="text-white/60 text-sm">Only approved followers can see your posts</p>
            </div>
            <ToggleSwitch />
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <span className="text-white font-medium">Show Activity Status</span>
              <p className="text-white/60 text-sm">Let others see when you're active</p>
            </div>
            <ToggleSwitch checked />
          </div>

          <div className="flex justify-between items-center">
            <div>
              <span className="text-white font-medium">Story Sharing</span>
              <p className="text-white/60 text-sm">Allow others to share your stories</p>
            </div>
            <ToggleSwitch checked />
          </div>
        </div>
      </div>

      <div className="glass rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Interactions</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-white font-medium">Comments</span>
            <select className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white">
              <option value="everyone">Everyone</option>
              <option value="followers">Followers Only</option>
              <option value="verified">Verified Users Only</option>
              <option value="off">Off</option>
            </select>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-white font-medium">Messages</span>
            <select className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white">
              <option value="verified">Verified Users Only</option>
              <option value="followers">Followers Only</option>
              <option value="off">Off</option>
            </select>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-white font-medium">Tags & Mentions</span>
            <select className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white">
              <option value="everyone">Everyone</option>
              <option value="followers">Followers Only</option>
              <option value="off">Off</option>
            </select>
          </div>
        </div>
      </div>

      <div className="glass rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Data & History</h3>
        <div className="space-y-4">
          <Button variant="secondary" className="w-full justify-between">
            <span>Search History</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
          <Button variant="secondary" className="w-full justify-between">
            <span>Clear Cache</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  )

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="glass rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Push Notifications</h3>
        <div className="space-y-4">
          {[
            { title: 'Likes', desc: 'When someone likes your posts' },
            { title: 'Comments', desc: 'When someone comments on your posts' },
            { title: 'New Followers', desc: 'When someone starts following you' },
            { title: 'Messages', desc: 'When you receive a new message' },
            { title: 'Live Videos', desc: 'When someone you follow goes live' },
            { title: 'Trust Score Updates', desc: 'When your trust score changes' },
            { title: 'Verification Updates', desc: 'Updates about your verification status' }
          ].map((item, index) => (
            <div key={index} className="flex justify-between items-center">
              <div>
                <span className="text-white font-medium">{item.title}</span>
                <p className="text-white/60 text-sm">{item.desc}</p>
              </div>
              <ToggleSwitch checked />
            </div>
          ))}
        </div>
      </div>

      <div className="glass rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Email Notifications</h3>
        <div className="space-y-4">
          {[
            { title: 'Security Alerts', desc: 'Important security updates' },
            { title: 'Product Updates', desc: 'New features and improvements' },
            { title: 'Weekly Summary', desc: 'Your weekly activity summary' },
            { title: 'Marketing', desc: 'Tips and promotional content' }
          ].map((item, index) => (
            <div key={index} className="flex justify-between items-center">
              <div>
                <span className="text-white font-medium">{item.title}</span>
                <p className="text-white/60 text-sm">{item.desc}</p>
              </div>
              <ToggleSwitch checked={index < 2} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderContentSettings = () => (
    <div className="space-y-6">
      <div className="glass rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Content Preferences</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-white font-medium">Sensitive Content</span>
              <p className="text-white/60 text-sm">Control what sensitive content you see</p>
            </div>
            <select className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white">
              <option value="allow">Allow</option>
              <option value="limit">Limit</option>
              <option value="hide">Hide</option>
            </select>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <span className="text-white font-medium">Autoplay Videos</span>
              <p className="text-white/60 text-sm">Videos play automatically in feed</p>
            </div>
            <ToggleSwitch checked />
          </div>

          <div className="flex justify-between items-center">
            <div>
              <span className="text-white font-medium">High Quality Uploads</span>
              <p className="text-white/60 text-sm">Upload photos and videos in high quality</p>
            </div>
            <ToggleSwitch checked />
          </div>
        </div>
      </div>

      <div className="glass rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Language & Region</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-white font-medium">Language</span>
            <select className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white">
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
            </select>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-white font-medium">Time Zone</span>
            <select className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white">
              <option value="auto">Automatic</option>
              <option value="utc">UTC</option>
              <option value="est">EST</option>
              <option value="pst">PST</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )

  const renderBlockingSettings = () => (
    <div className="space-y-6">
      <div className="glass rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Blocked Accounts</h3>
        <p className="text-white/60 text-sm mb-4">Manage accounts you've blocked</p>
        <Button variant="secondary" className="w-full">View Blocked Accounts</Button>
      </div>

      <div className="glass rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Restricted Accounts</h3>
        <p className="text-white/60 text-sm mb-4">Accounts with limited interactions</p>
        <Button variant="secondary" className="w-full">View Restricted Accounts</Button>
      </div>

      <div className="glass rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Keyword Filters</h3>
        <p className="text-white/60 text-sm mb-4">Hide posts containing specific words</p>
        <Button variant="secondary" className="w-full">Manage Keywords</Button>
      </div>

      <div className="glass rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Comment Filters</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-white font-medium">Hide Offensive Comments</span>
              <p className="text-white/60 text-sm">Automatically hide potentially offensive comments</p>
            </div>
            <ToggleSwitch checked />
          </div>

          <div className="flex justify-between items-center">
            <div>
              <span className="text-white font-medium">Manual Filter</span>
              <p className="text-white/60 text-sm">Review comments before they appear</p>
            </div>
            <ToggleSwitch />
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>

          <div className="grid md:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="md:col-span-1">
              <div className="glass rounded-2xl p-4 sticky top-20">
                <nav className="space-y-2">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-left ${
                        activeSection === section.id
                          ? 'bg-primary-blue text-white'
                          : 'text-white/70 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span className="text-lg">{section.icon}</span>
                      <span className="font-medium text-sm">{section.title}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Content */}
            <div className="md:col-span-3">
              <div className="glass rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6">
                  {sections.find(s => s.id === activeSection)?.title}
                </h2>

                {activeSection === 'profile' && renderProfileSettings()}
                {activeSection === 'account' && renderAccountSettings()}
                {activeSection === 'privacy' && renderPrivacySettings()}
                {activeSection === 'notifications' && renderNotificationSettings()}
                {activeSection === 'content' && renderContentSettings()}
                {activeSection === 'blocking' && renderBlockingSettings()}
                {activeSection === 'verification' && (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">🛡️</div>
                    <h3 className="text-xl font-semibold text-white mb-2">Verification Center</h3>
                    <p className="text-white/70 mb-6">Manage your verification status and trust score</p>
                    <Button variant="trust">Go to Verification</Button>
                  </div>
                )}
                {activeSection === 'trust' && (
                  <div className="space-y-6">
                    <div className="glass rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Safety Tools</h3>
                      <div className="space-y-4">
                        <Button variant="secondary" className="w-full justify-between">
                          <span>Report a Problem</span>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Button>
                        <Button variant="secondary" className="w-full justify-between">
                          <span>Safety Resources</span>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Button>
                        <Button variant="secondary" className="w-full justify-between">
                          <span>Community Guidelines</span>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                {activeSection === 'data' && (
                  <div className="space-y-6">
                    <div className="glass rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Download Your Information</h3>
                      <p className="text-white/60 text-sm mb-4">Get a copy of your TrueTribe data</p>
                      <Button variant="secondary" className="w-full">Request Download</Button>
                    </div>
                    <div className="glass rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Data Usage</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-white/80">Storage Used</span>
                          <span className="text-white">2.4 GB</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/80">Posts</span>
                          <span className="text-white">1,234</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/80">Photos</span>
                          <span className="text-white">567</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {activeSection === 'help' && (
                  <div className="space-y-6">
                    <div className="glass rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Get Help</h3>
                      <div className="space-y-4">
                        <Button variant="secondary" className="w-full justify-between">
                          <span>Help Center</span>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </Button>
                        <Button variant="secondary" className="w-full justify-between">
                          <span>Contact Support</span>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </Button>
                        <Button variant="secondary" className="w-full justify-between">
                          <span>Privacy Policy</span>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </Button>
                        <Button variant="secondary" className="w-full justify-between">
                          <span>Terms of Service</span>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </Button>
                      </div>
                    </div>
                    <div className="glass rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">App Info</h3>
                      <div className="space-y-2 text-white/60 text-sm">
                        <p>Version: 1.0.0</p>
                        <p>Build: 2024.1.1</p>
                        <p>© 2024 TrueTribe. All rights reserved.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}