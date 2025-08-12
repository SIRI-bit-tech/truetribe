# TrueTribe Backend

A complete Django REST API backend for the TrueTribe social media platform with trust scoring, verification system, and real-time messaging.

## 🚀 Features

- **User Management**: Registration, authentication, profiles, follow/unfollow
- **Content System**: Posts, videos, comments, likes, shares
- **Trust System**: Dynamic trust scoring, reputation management, reporting
- **Verification**: Email, phone, identity verification with badges
- **Messaging**: Real-time chat with WebSocket support
- **Notifications**: Real-time notification system
- **Media Management**: File upload and management
- **Admin Panel**: Complete admin interface
- **Security**: JWT authentication, CORS, input validation

## 🛠️ Tech Stack

- **Framework**: Django 4.2.7 + Django REST Framework
- **Database**: SQLite (development) / PostgreSQL (production)
- **Authentication**: JWT with SimpleJWT
- **Real-time**: Django Channels + Redis
- **Background Tasks**: Celery + Redis
- **File Storage**: Local storage / Cloudinary
- **API Documentation**: Built-in browsable API

## 📦 Installation

### Prerequisites
- Python 3.8+
- Redis (for real-time features)

### Quick Start

1. **Clone and navigate to backend**:
   ```bash
   cd truetribe-backend
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Start the server** (automated setup):
   ```bash
   python start_server.py
   ```

This will automatically:
- Create database migrations
- Run migrations
- Create superuser (admin/admin123)
- Create sample data
- Start development server

### Manual Setup

If you prefer manual setup:

```bash
# Create migrations
python manage.py makemigrations

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Create sample data
python manage_commands.py

# Start server
python manage.py runserver 0.0.0.0:8000
```

## 🔗 API Endpoints

### Base URL: `http://127.0.0.1:8000/api/`

### Authentication
- `POST /auth/register/` - User registration
- `POST /auth/login/` - User login
- `GET /auth/me/` - Get current user
- `POST /auth/logout/` - Logout

### Users
- `GET /users/` - List users (with search)
- `GET /users/{username}/` - Get user profile
- `PUT /users/profile/` - Update profile
- `POST /users/{username}/follow/` - Follow user
- `POST /users/{username}/unfollow/` - Unfollow user

### Posts
- `GET /posts/` - Get feed
- `POST /posts/create/` - Create post
- `POST /posts/{id}/like/` - Like/unlike post
- `GET /posts/{id}/comments/` - Get comments
- `POST /posts/{id}/comments/` - Add comment

### Videos
- `GET /videos/` - Get videos
- `POST /videos/create/` - Upload video
- `GET /videos/trending/` - Trending videos
- `POST /videos/{id}/like/` - Like video

### Messaging
- `GET /messaging/conversations/` - Get conversations
- `POST /messaging/conversations/create/` - Create conversation
- `GET /messaging/conversations/{id}/messages/` - Get messages
- `POST /messaging/conversations/{id}/messages/create/` - Send message

### Trust System
- `GET /trust/score/` - Get trust score
- `POST /trust/actions/record/` - Record trust action
- `POST /trust/reports/create/` - Report user
- `GET /trust/leaderboard/` - Trust leaderboard

### Verification
- `GET /verification/status/` - Verification status
- `POST /verification/email/send/` - Send email verification
- `POST /verification/phone/send/` - Send phone verification
- `POST /verification/requests/create/` - Request verification

### Notifications
- `GET /notifications/` - Get notifications
- `POST /notifications/{id}/read/` - Mark as read
- `GET /notifications/unread-count/` - Unread count

## 🔐 Authentication

All endpoints (except registration/login) require JWT authentication:

```bash
# Get token
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "demo@truetribe.com", "password": "demo123"}'

# Use token
curl -X GET http://127.0.0.1:8000/api/posts/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🌐 WebSocket Support

Real-time messaging via WebSocket:

```javascript
const ws = new WebSocket('ws://127.0.0.1:8000/ws/chat/CONVERSATION_ID/');

ws.onmessage = function(event) {
    const data = JSON.parse(event.data);
    console.log('Message received:', data);
};

ws.send(JSON.stringify({
    'type': 'chat_message',
    'content': 'Hello!'
}));
```

## 👤 Demo Accounts

- **Admin**: `admin` / `admin123`
- **Demo User**: `demo` / `demo123` (Trust Score: 92%)

## 📁 Project Structure

```
truetribe-backend/
├── authentication/          # JWT auth, login/register
├── users/                  # User profiles, follow system
├── posts/                  # Posts, comments, likes
├── videos/                 # Video content system
├── messaging/              # Real-time chat
├── notifications/          # Notification system
├── trust_system/           # Trust scoring & reports
├── verification/           # Verification system
├── scam_detection/         # Scam detection
├── live_streaming/         # Live streaming
├── media_management/       # File management
├── admin_panel/            # Admin interface
├── truetribe_backend/      # Django settings
├── media/                  # Uploaded files
├── static/                 # Static files
├── requirements.txt        # Dependencies
├── start_server.py         # Automated setup
└── API_DOCUMENTATION.md    # Full API docs
```

## 🔧 Configuration

Environment variables in `.env`:

```env
SECRET_KEY=your-secret-key
DEBUG=True
REDIS_URL=redis://localhost:6379/0
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## 🚀 Production Deployment

1. Set `DEBUG=False` in settings
2. Configure PostgreSQL database
3. Set up Redis for caching/WebSocket
4. Configure Cloudinary for media storage
5. Set up Celery for background tasks
6. Use Gunicorn + Nginx for serving

## 📚 API Documentation

- **Browsable API**: http://127.0.0.1:8000/api/
- **Admin Panel**: http://127.0.0.1:8000/admin/
- **Full Documentation**: [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

## 🤝 Frontend Integration

This backend is designed to work with the TrueTribe Next.js frontend. Key integration points:

- JWT token authentication
- Real-time WebSocket messaging
- File upload endpoints
- User profile management
- Trust score display
- Verification badges

## 📝 License

This project is part of the TrueTribe social media platform.

## 🆘 Support

For issues or questions:
1. Check the API documentation
2. Review the Django admin panel
3. Check server logs for errors
4. Ensure Redis is running for real-time features

---

**Ready to connect with your frontend!** 🎉