import axios from 'axios'
import { ApiResponse, PaginatedResponse } from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      window.location.href = '/auth/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/api/v1/auth/login/', { email, password }),
  
  register: (userData: any) =>
    api.post('/api/v1/auth/register/', userData),
  
  logout: () =>
    api.post('/api/v1/auth/logout/'),
  
  refreshToken: (refresh: string) =>
    api.post('/api/v1/auth/refresh/', { refresh }),
  
  verifyEmail: (token: string) =>
    api.post('/api/v1/auth/verify-email/', { token }),
  
  resetPassword: (email: string) =>
    api.post('/api/v1/auth/reset-password/', { email }),
}

// Users API
export const usersAPI = {
  getProfile: (userId?: string) =>
    api.get(`/api/v1/users/${userId ? `${userId}/` : 'me/'}`),
  
  updateProfile: (data: any) =>
    api.patch('/api/v1/users/me/', data),
  
  follow: (userId: string) =>
    api.post(`/api/v1/users/${userId}/follow/`),
  
  unfollow: (userId: string) =>
    api.delete(`/api/v1/users/${userId}/follow/`),
  
  getFollowers: (userId: string, page = 1) =>
    api.get(`/api/v1/users/${userId}/followers/?page=${page}`),
  
  getFollowing: (userId: string, page = 1) =>
    api.get(`/api/v1/users/${userId}/following/?page=${page}`),
  
  searchUsers: (query: string, page = 1) =>
    api.get(`/api/v1/users/search/?q=${query}&page=${page}`),
}

// Posts API
export const postsAPI = {
  getFeed: (page = 1) =>
    api.get(`/api/v1/posts/feed/?page=${page}`),
  
  getPost: (postId: string) =>
    api.get(`/api/v1/posts/${postId}/`),
  
  createPost: (data: FormData) =>
    api.post('/api/v1/posts/', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  updatePost: (postId: string, data: any) =>
    api.patch(`/api/v1/posts/${postId}/`, data),
  
  deletePost: (postId: string) =>
    api.delete(`/api/v1/posts/${postId}/`),
  
  likePost: (postId: string) =>
    api.post(`/api/v1/posts/${postId}/like/`),
  
  unlikePost: (postId: string) =>
    api.delete(`/api/v1/posts/${postId}/like/`),
  
  bookmarkPost: (postId: string) =>
    api.post(`/api/v1/posts/${postId}/bookmark/`),
  
  getComments: (postId: string, page = 1) =>
    api.get(`/api/v1/posts/${postId}/comments/?page=${page}`),
  
  addComment: (postId: string, content: string) =>
    api.post(`/api/v1/posts/${postId}/comments/`, { content }),
}

// Stories API
export const storiesAPI = {
  getStories: () =>
    api.get('/api/v1/posts/stories/'),
  
  createStory: (data: FormData) =>
    api.post('/api/v1/posts/stories/', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  viewStory: (storyId: string) =>
    api.post(`/api/v1/posts/stories/${storyId}/view/`),
}

// Videos API
export const videosAPI = {
  getVideoFeed: (page = 1) =>
    api.get(`/api/v1/videos/feed/?page=${page}`),
  
  getVideo: (videoId: string) =>
    api.get(`/api/v1/videos/${videoId}/`),
  
  uploadVideo: (data: FormData) =>
    api.post('/api/v1/videos/', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  likeVideo: (videoId: string) =>
    api.post(`/api/v1/videos/${videoId}/like/`),
  
  getVideoComments: (videoId: string, page = 1) =>
    api.get(`/api/v1/videos/${videoId}/comments/?page=${page}`),
}

// Live Streaming API
export const liveAPI = {
  getLiveStreams: () =>
    api.get('/api/v1/live/streams/'),
  
  startStream: (data: any) =>
    api.post('/api/v1/live/streams/', data),
  
  endStream: (streamId: string) =>
    api.patch(`/api/v1/live/streams/${streamId}/end/`),
  
  joinStream: (streamId: string) =>
    api.post(`/api/v1/live/streams/${streamId}/join/`),
}

// Messaging API
export const messagingAPI = {
  getConversations: (page = 1) =>
    api.get(`/api/v1/messages/conversations/?page=${page}`),
  
  getMessages: (conversationId: string, page = 1) =>
    api.get(`/api/v1/messages/conversations/${conversationId}/messages/?page=${page}`),
  
  sendMessage: (conversationId: string, data: any) =>
    api.post(`/api/v1/messages/conversations/${conversationId}/messages/`, data),
  
  createConversation: (userId: string) =>
    api.post('/api/v1/messages/conversations/', { participant: userId }),
}

// Verification API
export const verificationAPI = {
  submitVerification: (data: FormData) =>
    api.post('/api/v1/verification/submit/', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  getVerificationStatus: () =>
    api.get('/api/v1/verification/status/'),
  
  submitExpertiseVerification: (data: any) =>
    api.post('/api/v1/verification/expertise/', data),
}

// Trust System API
export const trustAPI = {
  getTrustScore: (userId?: string) =>
    api.get(`/api/v1/trust/score/${userId ? `${userId}/` : 'me/'}`),
  
  reportScam: (data: any) =>
    api.post('/api/v1/trust/report-scam/', data),
  
  factCheck: (postId: string, data: any) =>
    api.post(`/api/v1/trust/fact-check/${postId}/`, data),
}

// Notifications API
export const notificationsAPI = {
  getNotifications: (page = 1) =>
    api.get(`/api/v1/notifications/?page=${page}`),
  
  markAsRead: (notificationId: string) =>
    api.patch(`/api/v1/notifications/${notificationId}/read/`),
  
  markAllAsRead: () =>
    api.post('/api/v1/notifications/mark-all-read/'),
}

export default api