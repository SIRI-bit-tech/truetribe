# TrueTribe Backend API Documentation

## Base URL
```
http://127.0.0.1:8000/api/
```

## Authentication
All API endpoints (except registration and login) require JWT authentication.

### Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

## Authentication Endpoints

### Register
```
POST /api/auth/register/
{
    "username": "string",
    "email": "string",
    "password": "string",
    "password_confirm": "string",
    "first_name": "string",
    "last_name": "string"
}
```

### Login
```
POST /api/auth/login/
{
    "email": "string",
    "password": "string"
}
```

### Get Current User
```
GET /api/auth/me/
```

### Logout
```
POST /api/auth/logout/
{
    "refresh_token": "string"
}
```

## User Endpoints

### Get Users
```
GET /api/users/?search=username
```

### Get User Profile
```
GET /api/users/{username}/
```

### Update Profile
```
PUT /api/users/profile/
{
    "first_name": "string",
    "last_name": "string",
    "bio": "string",
    "website": "string",
    "location": "string"
}
```

### Follow User
```
POST /api/users/{username}/follow/
```

### Unfollow User
```
POST /api/users/{username}/unfollow/
```

### Get Followers
```
GET /api/users/{username}/followers/
```

### Get Following
```
GET /api/users/{username}/following/
```

## Post Endpoints

### Get Feed
```
GET /api/posts/
```

### Create Post
```
POST /api/posts/create/
{
    "content": "string",
    "image": "file"
}
```

### Get Post
```
GET /api/posts/{post_id}/
```

### Like Post
```
POST /api/posts/{post_id}/like/
```

### Share Post
```
POST /api/posts/{post_id}/share/
```

### Get Post Comments
```
GET /api/posts/{post_id}/comments/
```

### Add Comment
```
POST /api/posts/{post_id}/comments/
{
    "content": "string",
    "parent": "uuid (optional)"
}
```

### Get User Posts
```
GET /api/posts/user/{username}/
```

## Video Endpoints

### Get Videos
```
GET /api/videos/
```

### Create Video
```
POST /api/videos/create/
{
    "title": "string",
    "description": "string",
    "video_file": "file",
    "thumbnail": "file",
    "is_public": true
}
```

### Get Trending Videos
```
GET /api/videos/trending/
```

### Like Video
```
POST /api/videos/{video_id}/like/
```

### Get Video Comments
```
GET /api/videos/{video_id}/comments/
```

## Messaging Endpoints

### Get Conversations
```
GET /api/messaging/conversations/
```

### Create Conversation
```
POST /api/messaging/conversations/create/
{
    "participants": ["user_id1", "user_id2"],
    "is_group": false,
    "group_name": "string (optional)"
}
```

### Get Messages
```
GET /api/messaging/conversations/{conversation_id}/messages/
```

### Send Message
```
POST /api/messaging/conversations/{conversation_id}/messages/create/
{
    "message_type": "text",
    "content": "string",
    "file": "file (optional)",
    "reply_to": "message_id (optional)"
}
```

### Mark Messages as Read
```
POST /api/messaging/conversations/{conversation_id}/mark-read/
```

## Trust System Endpoints

### Get Trust Score
```
GET /api/trust/score/
GET /api/trust/score/{username}/
```

### Get Trust Actions
```
GET /api/trust/actions/
```

### Record Trust Action
```
POST /api/trust/actions/record/
{
    "action_type": "string",
    "score_change": 5.0,
    "description": "string"
}
```

### Create Report
```
POST /api/trust/reports/create/
{
    "reported_user": "user_id",
    "report_type": "spam",
    "description": "string"
}
```

### Get Trust Leaderboard
```
GET /api/trust/leaderboard/
```

## Verification Endpoints

### Get Verification Status
```
GET /api/verification/status/
```

### Send Email Verification
```
POST /api/verification/email/send/
{
    "email": "string"
}
```

### Verify Email
```
POST /api/verification/email/verify/
{
    "token": "string"
}
```

### Send Phone Verification
```
POST /api/verification/phone/send/
{
    "phone_number": "string"
}
```

### Verify Phone
```
POST /api/verification/phone/verify/
{
    "verification_code": "string"
}
```

### Create Verification Request
```
POST /api/verification/requests/create/
{
    "verification_type": "identity",
    "submitted_data": {}
}
```

## Notification Endpoints

### Get Notifications
```
GET /api/notifications/
```

### Mark Notification as Read
```
POST /api/notifications/{notification_id}/read/
```

### Mark All as Read
```
POST /api/notifications/mark-all-read/
```

### Get Unread Count
```
GET /api/notifications/unread-count/
```

## WebSocket Endpoints

### Chat WebSocket
```
ws://127.0.0.1:8000/ws/chat/{conversation_id}/
```

Message format:
```json
{
    "type": "chat_message",
    "content": "Hello!"
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
    "error": "Error message",
    "details": "Additional details (optional)"
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Demo Credentials

- **Admin**: admin / admin123
- **Demo User**: demo / demo123

## Getting Started

1. Install dependencies: `pip install -r requirements.txt`
2. Run setup: `python start_server.py`
3. Access API at: `http://127.0.0.1:8000/api/`
4. Access Admin at: `http://127.0.0.1:8000/admin/`