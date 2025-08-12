export interface User {
  id: string
  username: string
  email: string
  full_name: string
  bio?: string
  avatar?: string
  cover_image?: string
  trust_score: number
  followers_count: number
  following_count: number
  posts_count: number
  id_verified: boolean
  face_verified: boolean
  education_verified: boolean
  profession_verified: boolean
  location_verified: boolean
  expertise_areas: string[]
  created_at: string
  is_online: boolean
  last_seen?: string
}

export interface Post {
  id: string
  user: User
  content: string
  images: string[]
  likes_count: number
  comments_count: number
  shares_count: number
  is_liked: boolean
  is_bookmarked: boolean
  created_at: string
  trust_score: number
  fact_checked: boolean
  location?: string
  hashtags: string[]
}

export interface Story {
  id: string
  user: User
  media_url: string
  media_type: 'image' | 'video'
  created_at: string
  expires_at: string
  views_count: number
  is_viewed: boolean
}

export interface Video {
  id: string
  user: User
  title: string
  description: string
  video_url: string
  thumbnail_url: string
  duration: number
  views_count: number
  likes_count: number
  comments_count: number
  shares_count: number
  is_liked: boolean
  created_at: string
  trust_score: number
  hashtags: string[]
}

export interface LiveStream {
  id: string
  user: User
  title: string
  description: string
  stream_url: string
  thumbnail_url: string
  viewers_count: number
  is_live: boolean
  started_at: string
  ended_at?: string
  category: string
}

export interface Message {
  id: string
  sender: User
  recipient: User
  content: string
  message_type: 'text' | 'image' | 'video' | 'audio'
  media_url?: string
  is_read: boolean
  created_at: string
  trust_verified: boolean
}

export interface Conversation {
  id: string
  participants: User[]
  last_message: Message
  unread_count: number
  updated_at: string
}

export interface Verification {
  id: string
  user_id: string
  verification_type: 'id' | 'face' | 'education' | 'profession' | 'location'
  status: 'pending' | 'approved' | 'rejected'
  documents: string[]
  submitted_at: string
  reviewed_at?: string
  reviewer_notes?: string
}

export interface TrustScore {
  user_id: string
  overall_score: number
  accuracy_score: number
  reliability_score: number
  expertise_score: number
  community_score: number
  last_updated: string
}

export interface ScamReport {
  id: string
  reporter: User
  reported_user?: User
  reported_post?: Post
  report_type: 'scam' | 'misinformation' | 'fake_profile' | 'spam'
  description: string
  evidence: string[]
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed'
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: 'like' | 'comment' | 'follow' | 'mention' | 'verification' | 'trust_update'
  title: string
  message: string
  is_read: boolean
  created_at: string
  action_url?: string
}

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  results: T[]
  count: number
  next?: string
  previous?: string
}