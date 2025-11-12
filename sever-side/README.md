# VolunteerHub API 🤝

A comprehensive volunteer management platform backend built with Node.js and Express, featuring event management, volunteer registration, social interactions, and real-time notifications.

---

## 📋 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Docker Deployment](#docker-deployment)
- [Database Schema](#database-schema)
- [Security Features](#security-features)
- [License](#license)

---

## 🌟 Overview

**VolunteerHub** is a robust backend API designed to manage volunteer activities, events, and community engagement. It provides a complete solution for organizations to coordinate volunteers, manage events, track registrations, and facilitate community interaction through posts and comments.

The platform supports multiple user roles (User, Manager, Admin) with role-based access control, real-time web push notifications, and comprehensive analytics through an intuitive dashboard.

---

## ✨ Features

### 👥 User Management
- 🔐 **JWT Authentication**: Secure token-based authentication with cookie support
- 👤 **User Roles**: Three-tier role system (User, Manager, Admin)
- 🔒 **Account Status**: Active/Locked account management
- 📧 **Profile Management**: Update profile information, avatar, phone number
- 🔔 **Push Notifications**: Web push notification subscriptions

### 📅 Event Management
- ✅ **Event Lifecycle**: Complete CRUD operations for events
- 🎯 **Event Categories**: Multi-category classification system
- 📊 **Event Status**: Pending, Approved, Rejected, Cancelled, Completed
- 📸 **Media Support**: Thumbnails and multiple images
- 📍 **Location Tracking**: Location-based event organization
- 📈 **Analytics**: View counts, likes, registrations, and posts tracking
- 🔍 **Advanced Search**: Full-text search across name, description, location

### 📝 Registration System
- 📋 **Volunteer Registration**: Users can register for events
- ✅ **Status Management**: Pending, Confirmed, Completed, Cancelled
- 📊 **Capacity Control**: Event capacity management
- 👨‍💼 **Manager Control**: Managers can approve/reject registrations
- 📤 **Export Functionality**: Export registration data to CSV

### 📰 Social Features
- 📝 **Posts**: Create posts related to events
- 💬 **Comments**: Nested comment system with parent-child relationships
- ❤️ **Likes**: Like events, posts, and comments
- 🔖 **Bookmarks**: Save favorite events for quick access
- 📊 **Engagement Tracking**: Likes count, comments count, views count

### 🔔 Notification System
- 📬 **Real-time Notifications**: Instant notifications for user actions
- 🔕 **Notification Types**:
  - Like notifications (event, post, comment)
  - Comment and reply notifications
  - New post notifications on followed events
  - Event status updates (approved, rejected, etc.)
  - Registration status updates (confirmed, cancelled)
- ✅ **Read/Unread Status**: Track notification status
- 📨 **Push Notifications**: Web push support via VAPID

### 🔍 Search & Discovery
- 🌐 **Global Search**: Search across events, posts, users, categories
- 📊 **Advanced Filtering**: Filter by category, status, date range
- 🔥 **Trending Events**: Discover popular events
- 📅 **Upcoming Events**: View scheduled events
- 🏆 **Completed Events**: Browse past events

### 📊 Dashboard & Analytics
- 📈 **User Statistics**: Track user registrations, posts, events
- 📊 **Event Analytics**: View event performance metrics
- 🎯 **Manager Dashboard**: Dedicated dashboard for event managers
- 👨‍💼 **Admin Dashboard**: Comprehensive admin analytics and controls

### 🛡️ Admin Features
- 👥 **User Management**: View, lock/unlock user accounts
- ✅ **Event Approval**: Approve or reject event submissions
- 📋 **Category Management**: CRUD operations for categories
- 📤 **Data Export**: Export users and events data to CSV
- 📊 **System Overview**: Total users, events, registrations statistics

### 👨‍💼 Manager Features
- 📅 **Event Management**: Create and manage own events
- ✅ **Registration Control**: Approve/reject volunteer registrations
- 📤 **Export Registrations**: Export registration lists to CSV
- 📊 **Event Analytics**: Track event performance

---

## 🛠️ Tech Stack

### Core Technologies
- **Runtime**: Node.js
- **Framework**: Express.js v5.1.0
- **Database**: MongoDB with Mongoose ODM v8.19.1
- **Cache**: Redis v5.8.3

### Security & Authentication
- **Authentication**: JSON Web Tokens (JWT) v9.0.2
- **Password Hashing**: bcrypt v6.0.0, bcryptjs v3.0.2
- **Security Headers**: Helmet v8.1.0
- **CORS**: CORS v2.8.5
- **Rate Limiting**: express-rate-limit v8.2.1, rate-limit-redis v4.2.3

### Data Validation
- **Schema Validation**: Joi v18.0.1
- **Input Validation**: Validator v13.15.15

### Notifications
- **Web Push**: web-push v3.6.7

### Data Export
- **CSV Export**: json2csv v6.0.0, json-2-csv v5.5.9

### API Documentation
- **Documentation**: Swagger (swagger-jsdoc v6.2.8, swagger-ui-express v5.0.1)

### Development Tools
- **Hot Reload**: Nodemon v3.1.10
- **Environment Variables**: dotenv v17.2.3
- **Middleware**: body-parser v2.2.0, cookie-parser v1.4.7

---

## 🚀 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local instance or MongoDB Atlas)
- Redis (local or cloud instance)
- npm or yarn package manager

### Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/tsunflowerr/VolunteerHub.git
   cd VolunteerHub/sever-side
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Server Configuration
   PORT=4000
   CLIENT_URL=http://localhost:3000
   NODE_ENV=development

   # Database
   MONGODB_URI=mongodb://localhost:27017/volunteerhub
   # Or MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/volunteerhub

   # Redis Cache
   REDIS_URL=redis://localhost:6379

   # JWT Secret
   JWT_SECRET=your_super_secret_jwt_key_here_change_in_production

   # Web Push Notifications (VAPID)
   VAPID_PUBLIC_KEY=your_vapid_public_key
   VAPID_PRIVATE_KEY=your_vapid_private_key
   ```

4. **Generate VAPID keys for push notifications** (Optional)
   ```bash
   npx web-push generate-vapid-keys
   ```
   Copy the generated keys to your `.env` file.

5. **Start MongoDB and Redis**
   
   Make sure MongoDB and Redis are running on your machine:
   ```bash
   # MongoDB (if installed locally)
   mongod

   # Redis (if installed locally)
   redis-server
   ```

6. **Start the development server**
   ```bash
   npm start
   ```

   The server will run on `http://localhost:4000`

7. **Access API Documentation**
   
   Open your browser and visit:
   ```
   http://localhost:4000/api-docs
   ```

---

## 🔐 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | `4000` |
| `CLIENT_URL` | Frontend URL for CORS | No | `http://localhost:3000` |
| `NODE_ENV` | Environment mode | No | `development` |
| `MONGODB_URI` | MongoDB connection string | Yes | - |
| `REDIS_URL` | Redis connection URL | No | `redis://localhost:6379` |
| `JWT_SECRET` | Secret key for JWT signing | Yes | - |
| `VAPID_PUBLIC_KEY` | VAPID public key for web push | Yes | - |
| `VAPID_PRIVATE_KEY` | VAPID private key for web push | Yes | - |

---

## 📚 API Documentation

### Interactive Documentation
Once the server is running, access the comprehensive Swagger documentation at:

**URL**: `http://localhost:4000/api-docs`

### Base URL
```
http://localhost:4000/api
```

### Authentication
The API uses JWT (JSON Web Token) for authentication. Tokens can be sent via:
1. **Cookie** (automatic, recommended)
2. **Authorization Header**: `Authorization: Bearer <token>`

### Rate Limiting
- **API Endpoints**: 100 requests per 15 minutes
- **Auth Endpoints**: 5 requests per 15 minutes
- **Registration**: 3 requests per 15 minutes
- **Search**: 50 requests per 15 minutes

### Main API Endpoints

#### 🔐 Authentication
```http
POST   /api/auth/register          # Register new user
POST   /api/auth/login             # Login user
POST   /api/auth/logout            # Logout user
GET    /api/auth/me                # Get current user info
```

#### 👤 User Management
```http
GET    /api/users/profile/:userId  # Get user profile
PUT    /api/users/profile          # Update current user profile
POST   /api/users/push-subscription # Subscribe to push notifications
POST   /api/users/bookmark/:eventId # Bookmark/unbookmark event
GET    /api/users/bookmarks        # Get user bookmarks
```

#### 📂 Categories
```http
GET    /api/categories             # Get all categories
GET    /api/categories/:categoryId # Get category by ID
POST   /api/categories             # Create category (auth required)
PUT    /api/categories/:categoryId # Update category (auth required)
DELETE /api/categories/:categoryId # Delete category (auth required)
```

#### 📅 Events
```http
GET    /api/events                 # Get all events
GET    /api/events/:eventId        # Get event by ID
POST   /api/events                 # Create event (manager/admin)
PUT    /api/events/:eventId        # Update event (manager/admin)
DELETE /api/events/:eventId        # Delete event (manager/admin)
POST   /api/events/:eventId/like   # Like/unlike event (auth required)
GET    /api/events/category/:categoryId # Get events by category
GET    /api/events/trending        # Get trending events
GET    /api/events/upcoming        # Get upcoming events
GET    /api/events/completed       # Get completed events
```

#### 📝 Posts
```http
GET    /api/events/:eventId/posts  # Get posts for event
POST   /api/events/:eventId/posts  # Create post (auth required)
PUT    /api/events/:eventId/posts/:postId # Update post (auth required)
DELETE /api/events/:eventId/posts/:postId # Delete post (auth required)
POST   /api/events/:eventId/posts/:postId/like # Like/unlike post
```

#### 💬 Comments
```http
GET    /api/events/:eventId/posts/:postId/comments # Get comments
POST   /api/events/:eventId/posts/:postId/comments # Create comment (auth)
PUT    /api/events/:eventId/comments/:commentId # Update comment (auth)
DELETE /api/events/:eventId/comments/:commentId # Delete comment (auth)
POST   /api/events/:eventId/comments/:commentId/like # Like/unlike comment
```

#### 📋 Registrations
```http
GET    /api/events/:eventId/registrations # Get event registrations
POST   /api/events/:eventId/register # Register for event (auth required)
DELETE /api/events/:eventId/register # Cancel registration (auth required)
```

#### 🔔 Notifications
```http
GET    /api/notifications          # Get user notifications (auth required)
GET    /api/notifications/unread-count # Get unread count (auth required)
PUT    /api/notifications/:notificationId/read # Mark as read (auth)
PUT    /api/notifications/read-all # Mark all as read (auth required)
DELETE /api/notifications/:notificationId # Delete notification (auth)
```

#### 🔍 Search
```http
GET    /api/search?q=query&type=all # Global search
# Types: all, events, posts, users, categories
```

#### 📊 Dashboard
```http
GET    /api/dashboard/stats        # Get user dashboard statistics (auth)
```

#### 👨‍💼 Manager Routes
```http
GET    /api/manager/events         # Get manager's events
GET    /api/manager/events/:eventId/registrations # Get registrations
PUT    /api/manager/registrations/:registrationId/status # Update status
GET    /api/manager/events/:eventId/export # Export registrations CSV
```

#### 🛡️ Admin Routes
```http
GET    /api/admin/users            # Get all users
PUT    /api/admin/users/:userId/status # Lock/unlock user
GET    /api/admin/events           # Get all events
PUT    /api/admin/events/:eventId/status # Approve/reject event
GET    /api/admin/categories       # Get all categories
POST   /api/admin/categories       # Create category
PUT    /api/admin/categories/:categoryId # Update category
DELETE /api/admin/categories/:categoryId # Delete category
GET    /api/admin/export/users     # Export users CSV
GET    /api/admin/export/events    # Export events CSV
```

### Response Format

#### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

#### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ]
}
```

### Example: Register & Login Flow

**1. Register**
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone_number": "0123456789"
  }'
```

**2. Login**
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**3. Use Token**
```bash
curl -X GET http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

For detailed API documentation with request/response examples, visit the Swagger documentation at `http://localhost:4000/api-docs`.

---

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

1. **Make sure Docker and Docker Compose are installed**
   ```bash
   docker --version
   docker-compose --version
   ```

2. **Create `.env` file** (see [Environment Variables](#environment-variables))

3. **Start services**
   ```bash
   docker-compose up -d
   ```

   This will start:
   - Redis container on port 6379
   - Backend API container on port 4000

4. **View logs**
   ```bash
   docker-compose logs -f backend
   ```

5. **Stop services**
   ```bash
   docker-compose down
   ```

### Manual Docker Build

1. **Build the image**
   ```bash
   docker build -t volunteerhub-api .
   ```

2. **Run the container**
   ```bash
   docker run -d \
     --name volunteerhub-api \
     -p 4000:4000 \
     --env-file .env \
     volunteerhub-api
   ```

### Docker Compose Services

The `docker-compose.yml` includes:

- **redis**: Redis cache service
  - Port: 6379
  - Volume: `redis_data` for data persistence
  
- **backend**: Node.js API service
  - Port: 4000
  - Auto-restart on failure
  - Health check enabled
  - Volume mount for development

### Health Check

The Docker container includes a health check that runs every 30 seconds:
```bash
curl http://localhost:4000/api/health
```

---

## 🗄️ Database Schema

### Collections Overview

#### 👤 Users
```javascript
{
  username: String,
  email: String (unique),
  password: String (hashed),
  role: Enum ["user", "manager", "admin"],
  avatar: String,
  phone_number: String,
  bookmarks: [ObjectId] (ref: Event),
  pushSubscription: Object,
  status: Enum ["active", "locked"],
  timestamps: true
}
```

#### 📅 Events
```javascript
{
  name: String,
  description: String,
  managerId: ObjectId (ref: User),
  category: [ObjectId] (ref: Category),
  location: String,
  thumbnail: String,
  images: [String],
  capacity: Number,
  status: Enum ["pending", "approved", "rejected", "cancelled", "completed"],
  startDate: Date,
  endDate: Date,
  likesCount: Number,
  viewCount: Number,
  registrationsCount: Number,
  postsCount: Number,
  timestamps: true
}
```

#### 📝 Posts
```javascript
{
  title: String,
  content: String,
  author: ObjectId (ref: User),
  image: [String],
  eventId: ObjectId (ref: Event),
  commentsCount: Number,
  likesCount: Number,
  timestamps: true
}
```

#### 💬 Comments
```javascript
{
  postId: ObjectId (ref: Post),
  eventId: ObjectId (ref: Event),
  content: String,
  author: ObjectId (ref: User),
  parentComment: ObjectId (ref: Comment, nullable),
  likesCount: Number,
  timestamps: true
}
```

#### ❤️ Likes
```javascript
{
  userId: ObjectId (ref: User),
  likeableId: String,
  likeableType: Enum ["event", "post", "comment"],
  createdAt: Date
}
```

#### 📋 Registrations
```javascript
{
  userId: ObjectId (ref: User),
  eventId: ObjectId (ref: Event),
  status: Enum ["pending", "confirmed", "completed", "cancelled"],
  registerAt: Date,
  timestamps: true
}
```

#### 🔔 Notifications
```javascript
{
  sender: ObjectId (ref: User),
  recipient: ObjectId (ref: User),
  type: Enum ["like", "comment", "comment_reply", "new_post", 
               "event_status_update", "registration_status_update"],
  relatedStatus: String (nullable),
  post: ObjectId (ref: Post, nullable),
  event: ObjectId (ref: Event, nullable),
  isRead: Boolean,
  content: String,
  timestamps: true
}
```

#### 📂 Categories
```javascript
{
  name: String (unique),
  slug: String (unique),
  description: String,
  createdAt: Date
}
```

### Indexes

Optimized indexes for fast queries:
- **Users**: Text search on username and email
- **Events**: Compound indexes on status, dates, manager, category; Text search
- **Posts**: Compound indexes on event and author; Text search
- **Comments**: Indexes on post, parent comment, author
- **Likes**: Unique compound index on userId, likeableId, likeableType
- **Registrations**: Unique compound index on userId and eventId
- **Notifications**: Compound index on recipient, read status, date

---

## 🔒 Security Features

### Authentication & Authorization
- ✅ JWT-based authentication with secure token signing
- ✅ Password hashing using bcrypt (10 rounds)
- ✅ Role-based access control (RBAC)
- ✅ Account status management (active/locked)
- ✅ Token expiration and refresh mechanism

### Security Headers
- ✅ Helmet.js for security headers
- ✅ Content Security Policy (CSP)
- ✅ Cross-Origin Embedder Policy

### Rate Limiting
- ✅ Redis-backed distributed rate limiting
- ✅ Different limits for different endpoint types
- ✅ IP-based rate limiting

### Input Validation
- ✅ Joi schema validation for all inputs
- ✅ Validator.js for email, URL validation
- ✅ XSS protection through input sanitization
- ✅ MongoDB injection prevention

### CORS Configuration
- ✅ Configurable origin whitelist
- ✅ Credentials support
- ✅ Environment-based configuration

### Data Protection
- ✅ Password excluded from query results
- ✅ Sensitive data not logged
- ✅ Secure cookie settings (HttpOnly)

### Best Practices
- ✅ Environment variable management
- ✅ Error handling without exposing internals
- ✅ Logging and monitoring ready
- ✅ Database connection pooling
- ✅ Redis connection management

---

## 📂 Project Structure

```
sever-side/
├── config/
│   ├── db.js              # MongoDB connection
│   ├── redis.js           # Redis client setup
│   └── swagger.js         # Swagger documentation config
├── controller/
│   ├── admin/             # Admin controllers
│   ├── manager/           # Manager controllers
│   ├── public/            # Public controllers (events, posts, etc.)
│   └── user/              # User controllers (auth, profile, notifications)
├── middleware/
│   ├── authMiddleware.js  # JWT authentication
│   ├── adminMiddleware.js # Admin authorization
│   ├── managerMiddleware.js # Manager authorization
│   ├── rateLimiter.js     # Rate limiting middleware
│   └── validate.js        # Validation middleware
├── models/
│   ├── userModel.js       # User schema
│   ├── eventModel.js      # Event schema
│   ├── postModel.js       # Post schema
│   ├── commentModel.js    # Comment schema
│   ├── likeModel.js       # Like schema
│   ├── registrationsModel.js # Registration schema
│   ├── notificationModel.js  # Notification schema
│   └── categoryModel.js   # Category schema
├── routes/
│   ├── index.js           # Main router
│   ├── authRoutes.js      # Authentication routes
│   ├── userRoutes.js      # User routes
│   ├── categoryRoutes.js  # Category routes
│   ├── eventRoutes.js     # Event routes
│   ├── searchRoutes.js    # Search routes
│   ├── dashboardRoutes.js # Dashboard routes
│   ├── notificationRoutes.js # Notification routes
│   ├── managerRoutes.js   # Manager routes
│   └── adminRoutes.js     # Admin routes
├── utils/
│   ├── cacheHelper.js     # Redis cache utilities
│   └── notificationHelper.js # Notification utilities
├── validators/
│   ├── userValidator.js   # User validation schemas
│   ├── eventValidator.js  # Event validation schemas
│   ├── postValidator.js   # Post validation schemas
│   ├── commentValidator.js # Comment validation schemas
│   ├── registrationValidator.js # Registration validation schemas
│   ├── searchValidator.js # Search validation schemas
│   └── categoryValidator.js # Category validation schemas
├── .env                   # Environment variables (create this)
├── .gitignore            # Git ignore file
├── docker-compose.yml    # Docker Compose configuration
├── Dockerfile            # Docker build configuration
├── package.json          # NPM dependencies
├── server.js             # Application entry point
├── API_DOCUMENTATION.md  # Detailed API documentation
└── README.md             # This file
```

---

## 🚧 Coming Soon

### Frontend Development
- 🎨 React-based web application
- 📱 Mobile-responsive design
- 🖼️ Rich UI/UX with Tailwind CSS
- ⚡ Real-time updates with WebSockets
- 📊 Interactive charts and analytics
- 📸 Image upload and management

### Additional Backend Features
- 📊 Advanced analytics and reporting
- 📧 Email notification system
- 💬 Real-time chat for events
- 🎫 QR code check-in system
- 📱 Mobile app API support
- 🌍 Geolocation-based event discovery
- 📅 Calendar integration
- 🏆 Gamification and badges
- 📈 Performance metrics dashboard

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is open source and available under the MIT License.

---

## 👨‍💻 Author

**tsunflowerr**

- GitHub: [@tsunflowerr](https://github.com/tsunflowerr)
- Repository: [VolunteerHub](https://github.com/tsunflowerr/VolunteerHub)

---

## 🙏 Acknowledgments

- Express.js team for the excellent web framework
- MongoDB team for the flexible database
- Redis team for the high-performance cache
- All open-source contributors

---

## 📞 Support

If you encounter any issues or have questions:

1. Check the [API Documentation](http://localhost:4000/api-docs)
2. Review the detailed [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
3. Open an issue on GitHub
4. Contact the development team

---

## ⚙️ Troubleshooting

### MongoDB Connection Issues
```bash
# Check MongoDB is running
mongod --version

# Test connection
mongo
```

### Redis Connection Issues
```bash
# Check Redis is running
redis-cli ping
# Should return: PONG
```

### Port Already in Use
```bash
# Find process using port 4000
netstat -ano | findstr :4000

# Kill the process (Windows)
taskkill /PID <process_id> /F
```

### VAPID Keys Not Set
```bash
# Generate new VAPID keys
npx web-push generate-vapid-keys
```

---

**Made with ❤️ by tsunflowerr**

⭐ **Star this repository if you find it helpful!**
