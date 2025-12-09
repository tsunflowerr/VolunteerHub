# 📚 VolunteerHub API - Hướng Dẫn Sử Dụng Cho Front-end

## 📖 Mục Lục

- [Giới Thiệu](#giới-thiệu)
- [Cấu Hình](#cấu-hình)
- [Xác Thực (Authentication)](#xác-thực-authentication)
- [API Endpoints](#api-endpoints)
  - [1. Authentication](#1-authentication)
  - [2. User Management](#2-user-management)
  - [3. Categories](#3-categories)
  - [4. Events](#4-events)
  - [5. Posts](#5-posts)
  - [6. Comments](#6-comments)
  - [7. Likes](#7-likes)
  - [8. Registrations](#8-registrations)
  - [9. Bookmarks](#9-bookmarks)
  - [10. Notifications](#10-notifications)
  - [11. Search](#11-search)
  - [12. Dashboard](#12-dashboard)
  - [13. Admin APIs](#13-admin-apis)
  - [14. Manager APIs](#14-manager-apis)
- [Response Format](#response-format)
- [Error Handling](#error-handling)

---

## Giới Thiệu

**Base URL**: `http://localhost:4000/api`

**API Documentation (Swagger)**: `http://localhost:4000/api-docs`

API này sử dụng JWT (JSON Web Token) để xác thực. Token có thể được gửi qua:

- Cookie (tự động)
- Header: `Authorization: Bearer <token>`

---

## Cấu Hình

### Headers Cần Thiết

```javascript
{
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_JWT_TOKEN" // Optional, nếu không dùng cookie
}
```

### CORS

API hỗ trợ CORS với credentials. Trong Axios, cần cấu hình:

```javascript
axios.defaults.withCredentials = true;
```

### Rate Limiting

- API endpoints: 100 requests/15 phút
- Auth endpoints: 5 requests/15 phút
- Registration: 3 requests/15 phút
- Search: 50 requests/15 phút

---

## Xác Thực (Authentication)

### Cách Lưu Token

Sau khi login thành công, bạn nhận được token qua:

1. **Cookie** (tự động lưu bởi browser)
2. **Response body** (có thể lưu vào localStorage/sessionStorage)

```javascript
// Ví dụ sau khi login
const response = await axios.post('/api/auth/login', {
  email: 'user@example.com',
  password: 'password123',
});

// Token trong response
const token = response.data.token;
localStorage.setItem('token', token);

// Hoặc sử dụng cookie (tự động)
```

### Gửi Request Với Token

```javascript
// Cách 1: Sử dụng cookie (đơn giản nhất)
axios.defaults.withCredentials = true;

// Cách 2: Sử dụng Bearer token
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

---

## API Endpoints

## 1. Authentication

### 1.1. Đăng Ký (Register)

```http
POST /api/auth/register
```

**Body:**

```json
{
  "username": "JohnDoe123",
  "email": "john@example.com",
  "password": "password123",
  "phoneNumber": "0123456789"
}
```

**Response Success (201):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "JohnDoe123",
    "email": "john@example.com",
    "phoneNumber": "0123456789",
    "role": "user",
    "avatar": "https://ui-avatars.com/api/?name=JohnDoe123&background=random",
    "status": "active"
  }
}
```

---

### 1.2. Đăng Nhập (Login)

```http
POST /api/auth/login
```

**Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response Success (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "JohnDoe123",
    "email": "john@example.com",
    "phoneNumber": "0123456789",
    "role": "user",
    "avatar": "https://ui-avatars.com/api/?name=JohnDoe123",
    "status": "active"
  }
}
```

**Cookie được set:**

```
token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; Path=/; HttpOnly
```

---

### 1.3. Đăng Xuất (Logout)

```http
POST /api/auth/logout
```

**Response Success (200):**

```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## 2. User Management

### 2.1. Lấy Profile Người Dùng Hiện Tại

```http
GET /api/users/profile
```

**Headers:** Authorization required

**Response Success (200):**

```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "id": "507f1f77bcf86cd799439011",
    "username": "JohnDoe123",
    "email": "john@example.com",
    "role": "user",
    "avatar": "https://...",
    "phoneNumber": "0123456789",
    "location": "San Francisco, CA",
    "bio": "Passionate Volunteer",
    "about": "Dedicated to making a positive impact in the community.",
    "interests": ["health", "education", "community-development"],
    "bookmarks": ["eventId1", "eventId2"],
    "status": "active",
    "joinedDate": "2022",
    "createdAt": "2022-01-01T00:00:00Z",
    "updatedAt": "2022-06-15T00:00:00Z",
    "stats": {
      "events": 24,
      "hours": 96,
      "hosts": 12
    }
  }
}
```

---

### 2.2. Cập Nhật Profile

```http
PUT /api/users/profile
```

**Headers:** Authorization required

**Body:**

```json
{
  "username": "JohnDoe123",
  "email": "newemail@example.com",
  "phoneNumber": "0987654321",
  "avatar": "https://example.com/avatar.jpg",
  "location": "San Francisco, CA",
  "bio": "Passionate Volunteer",
  "about": "Dedicated to making a positive impact in the community through volunteering.",
  "interests": ["health", "education", "community-development"]
}
```

**Field Validation:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| username | string | Yes | Alphanumeric, 3-30 characters |
| email | string | Yes | Valid email format |
| phoneNumber | string | Yes | Exactly 10 digits |
| avatar | string | No | Valid URL |
| location | string | No | Max 100 characters |
| bio | string | No | Max 100 characters |
| about | string | No | Max 500 characters |
| interests | array | No | Array of category slugs |

**Response Success (200):**

```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "JohnDoe123",
    "email": "newemail@example.com",
    "phoneNumber": "0987654321",
    "avatar": "https://example.com/avatar.jpg",
    "location": "San Francisco, CA",
    "bio": "Passionate Volunteer",
    "about": "Dedicated to making a positive impact in the community through volunteering.",
    "interests": ["health", "education", "community-development"]
  }
}
```

---

### 2.3. Đổi Mật Khẩu

```http
PUT /api/users/profile/password
```

**Headers:** Authorization required

**Body:**

```json
{
  "current_password": "oldpassword123",
  "new_password": "newpassword123",
  "confirm_new_password": "newpassword123"
}
```

**Response Success (200):**

```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

### 2.4. Xóa Tài Khoản

```http
DELETE /api/users/profile
```

**Headers:** Authorization required

**Response Success (200):**

```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

---

### 2.5. Lấy Thông Tin User Khác (Public)

```http
GET /api/users/:id
```

**Headers:** Authorization required

**Response Success (200):**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "John Doe",
    "avatar": "https://...",
    "role": "user"
  }
}
```

---

### 2.6. Lấy Events Đã Bookmark

```http
GET /api/users/bookmarks
```

**Headers:** Authorization required

**Response Success (200):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "event123",
      "name": "Beach Cleanup",
      "description": "...",
      "location": "Nha Trang Beach",
      "thumbnail": "https://...",
      "startDate": "2025-11-15T08:00:00Z",
      "endDate": "2025-11-15T18:00:00Z",
      "status": "approved"
    }
  ]
}
```

---

## 3. Categories

### 3.1. Lấy Tất Cả Categories

```http
GET /api/categories
```

**Response Success (200):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "cat123",
      "name": "Environment",
      "slug": "environment",
      "description": "Environmental protection activities",
      "color": "#4caf50",
      "createdAt": "2025-01-01T00:00:00Z"
    },
    {
      "_id": "cat124",
      "name": "Education",
      "slug": "education",
      "description": "Educational volunteer work",
      "color": "#2196f3"
    }
  ]
}
```

---

### 3.2. Lấy Category Theo Slug

```http
GET /api/categories/slug/:slug
```

**Example:** `GET /api/categories/slug/environment`

**Response Success (200):**

```json
{
  "success": true,
  "data": {
    "_id": "cat123",
    "name": "Environment",
    "slug": "environment",
    "description": "Environmental protection activities",
    "color": "#4caf50"
  }
}
```

---

### 3.3. Lấy Category Theo ID

```http
GET /api/categories/:id
```

**Response:** Giống như category by slug

---

## 4. Events

### 4.1. Lấy Tất Cả Events (Có Phân Trang)

```http
GET /api/events?page=1&limit=10
```

**Query Parameters:**

- `page` (optional): Số trang, mặc định = 1
- `limit` (optional): Số items/trang, mặc định = 10

**Response Success (200):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "event123",
      "name": "Beach Cleanup Drive",
      "description": "Join us to clean up the local beach",
      "location": "Nha Trang Beach, Vietnam",
      "thumbnail": "https://example.com/thumbnail.jpg",
      "images": ["https://example.com/img1.jpg"],
      "capacity": 50,
      "status": "approved",
      "startDate": "2025-11-15T08:00:00Z",
      "endDate": "2025-11-15T18:00:00Z",
      "likesCount": 25,
      "viewCount": 150,
      "registrationsCount": 30,
      "postsCount": 5,
      "managerId": {
        "_id": "manager123",
        "username": "Manager Name",
        "avatar": "https://..."
      },
      "categories": [
        {
          "_id": "cat123",
          "name": "Environment",
          "slug": "environment"
        }
      ],
      "createdAt": "2025-10-01T00:00:00Z",
      "updatedAt": "2025-10-15T00:00:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50
  }
}
```

---

### 4.2. Lấy Event Theo ID

```http
GET /api/events/:id
```

**Example:** `GET /api/events/507f1f77bcf86cd799439011`

**Response Success (200):**

```json
{
  "success": true,
  "data": {
    "_id": "event123",
    "name": "Beach Cleanup Drive",
    "description": "Join us to clean up the local beach",
    "location": "Nha Trang Beach, Vietnam",
    "thumbnail": "https://example.com/thumbnail.jpg",
    "images": ["https://example.com/img1.jpg"],
    "capacity": 50,
    "status": "approved",
    "startDate": "2025-11-15T08:00:00Z",
    "endDate": "2025-11-15T18:00:00Z",
    "likesCount": 25,
    "viewCount": 151,
    "registrationsCount": 30,
    "postsCount": 5,
    "managerId": {
      "_id": "manager123",
      "username": "Manager Name",
      "avatar": "https://..."
    },
    "categories": [
      {
        "_id": "cat123",
        "name": "Environment",
        "slug": "environment"
      }
    ]
  }
}
```

---

### 4.3. Lấy Trending Events

```http
GET /api/events/trending?page=1&limit=10
```

**Response:** Giống như get all events, nhưng được sắp xếp theo độ phổ biến

---

### 4.4. Lấy Upcoming Events

```http
GET /api/events/upcoming?page=1&limit=10
```

**Response:** Giống như get all events, nhưng chỉ lấy events sắp diễn ra

---

### 4.5. Lấy Events Theo Category

```http
GET /api/events/category/:slug
```

**Example:** `GET /api/events/category/environment`

**Response:** Giống như get all events, được filter theo category

---

## 5. Posts

### 5.1. Lấy Tất Cả Posts Của Event

```http
GET /api/events/:eventId/posts
```

**Response Success (200):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "post123",
      "title": "My volunteer experience",
      "content": "Today was an amazing day...",
      "image": ["https://example.com/img1.jpg"],
      "author": {
        "_id": "user123",
        "username": "John Doe",
        "avatar": "https://..."
      },
      "eventId": "event123",
      "commentsCount": 10,
      "likesCount": 25,
      "createdAt": "2025-11-16T10:00:00Z",
      "updatedAt": "2025-11-16T10:00:00Z"
    }
  ]
}
```

---

### 5.2. Tạo Post Mới

```http
POST /api/events/:eventId/posts
```

**Headers:** Authorization required

**Body:**

```json
{
  "title": "My volunteer experience",
  "content": "Today was an amazing day helping the community...",
  "image": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"]
}
```

**Response Success (201):**

```json
{
  "success": true,
  "message": "Post created successfully",
  "data": {
    "_id": "post123",
    "title": "My volunteer experience",
    "content": "Today was an amazing day...",
    "image": ["https://example.com/image1.jpg"],
    "author": "user123",
    "eventId": "event123",
    "commentsCount": 0,
    "likesCount": 0,
    "createdAt": "2025-11-16T10:00:00Z"
  }
}
```

---

### 5.3. Cập Nhật Post

```http
PUT /api/events/:eventId/posts/:postId
```

**Headers:** Authorization required (chỉ author mới có thể update)

**Body:**

```json
{
  "title": "Updated post title",
  "content": "Updated content...",
  "image": ["https://example.com/image1.jpg"]
}
```

**Response Success (200):**

```json
{
  "success": true,
  "message": "Post updated successfully"
}
```

---

### 5.4. Xóa Post

```http
DELETE /api/events/:eventId/posts/:postId
```

**Headers:** Authorization required (chỉ author mới có thể delete)

**Response Success (200):**

```json
{
  "success": true,
  "message": "Post deleted successfully"
}
```

---

## 6. Comments

### 6.1. Lấy Tất Cả Comments Của Post

```http
GET /api/events/:eventId/posts/:postId/comments
```

**Response Success (200):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "comment123",
      "content": "Great post!",
      "author": {
        "_id": "user456",
        "username": "Jane Smith",
        "avatar": "https://..."
      },
      "postId": "post123",
      "eventId": "event123",
      "parentComment": null,
      "likesCount": 5,
      "createdAt": "2025-11-16T11:00:00Z"
    },
    {
      "_id": "comment124",
      "content": "Thank you!",
      "author": {
        "_id": "user123",
        "username": "John Doe",
        "avatar": "https://..."
      },
      "postId": "post123",
      "eventId": "event123",
      "parentComment": "comment123",
      "likesCount": 2,
      "createdAt": "2025-11-16T11:05:00Z"
    }
  ]
}
```

---

### 6.2. Tạo Comment Mới

```http
POST /api/events/:eventId/posts/:postId/comments
```

**Headers:** Authorization required

**Body:**

```json
{
  "content": "This is a great post!"
}
```

**Response Success (201):**

```json
{
  "success": true,
  "message": "Comment created successfully",
  "data": {
    "_id": "comment123",
    "content": "This is a great post!",
    "author": "user123",
    "postId": "post123",
    "eventId": "event123",
    "parentComment": null,
    "likesCount": 0,
    "createdAt": "2025-11-16T11:00:00Z"
  }
}
```

---

### 6.3. Reply Comment (Trả Lời Comment)

```http
POST /api/events/:eventId/posts/:postId/comments/:commentId/reply
```

**Headers:** Authorization required

**Body:**

```json
{
  "content": "Thank you for your comment!"
}
```

**Response Success (201):**

```json
{
  "success": true,
  "message": "Reply created successfully",
  "data": {
    "_id": "comment124",
    "content": "Thank you for your comment!",
    "author": "user456",
    "postId": "post123",
    "eventId": "event123",
    "parentComment": "comment123",
    "likesCount": 0,
    "createdAt": "2025-11-16T11:05:00Z"
  }
}
```

---

### 6.4. Cập Nhật Comment

```http
PUT /api/events/:eventId/posts/:postId/comments/:commentId
```

**Headers:** Authorization required (chỉ author có thể update)

**Body:**

```json
{
  "content": "Updated comment content"
}
```

**Response Success (200):**

```json
{
  "success": true,
  "message": "Comment updated successfully"
}
```

---

### 6.5. Xóa Comment

```http
DELETE /api/events/:eventId/posts/:postId/comments/:commentId
```

**Headers:** Authorization required (chỉ author có thể delete)

**Response Success (200):**

```json
{
  "success": true,
  "message": "Comment deleted successfully"
}
```

---

## 7. Likes

### 7.1. Like Event

```http
POST /api/events/:eventId/like
```

**Headers:** Authorization required

**Response Success (200):**

```json
{
  "success": true,
  "message": "Event liked successfully"
}
```

**Note:** Gọi lại API này sẽ UNLIKE event

---

### 7.2. Like Post

```http
POST /api/events/:eventId/posts/:postId/like
```

**Headers:** Authorization required

**Response Success (200):**

```json
{
  "success": true,
  "message": "Post liked successfully"
}
```

---

### 7.3. Like Comment

```http
POST /api/events/:eventId/posts/:postId/comments/:commentId/like
```

**Headers:** Authorization required

**Response Success (200):**

```json
{
  "success": true,
  "message": "Comment liked successfully"
}
```

---

## 8. Registrations

### 8.1. Đăng Ký Event

```http
POST /api/events/:eventId/register
```

**Headers:** Authorization required

**Response Success (201):**

```json
{
  "success": true,
  "message": "Registered for event successfully",
  "data": {
    "_id": "reg123",
    "userId": "user123",
    "eventId": "event123",
    "status": "pending",
    "registerAt": "2025-11-01T10:00:00Z",
    "createdAt": "2025-11-01T10:00:00Z"
  }
}
```

**Errors:**

- `400`: Already registered or event is full

---

### 8.2. Hủy Đăng Ký Event

```http
DELETE /api/events/:eventId/unregister
```

**Headers:** Authorization required

**Response Success (200):**

```json
{
  "success": true,
  "message": "Unregistered from event successfully"
}
```

---

### 8.3. Lấy Danh Sách Events Đã Đăng Ký

```http
GET /api/events/registrations/my?status=pending&page=1&limit=10
```

**Headers:** Authorization required

**Query Parameters:**

- `status` (optional): pending, confirmed, completed, cancelled
- `page` (optional): Số trang
- `limit` (optional): Số items/trang

**Response Success (200):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "reg123",
      "userId": "user123",
      "eventId": {
        "_id": "event123",
        "name": "Beach Cleanup",
        "thumbnail": "https://...",
        "startDate": "2025-11-15T08:00:00Z",
        "location": "Nha Trang Beach"
      },
      "status": "pending",
      "registerAt": "2025-11-01T10:00:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 2,
    "totalItems": 15
  }
}
```

---

### 8.4. Lấy Chi Tiết Đăng Ký

```http
GET /api/events/registrations/:registrationId
```

**Headers:** Authorization required

**Response Success (200):**

```json
{
  "success": true,
  "data": {
    "_id": "reg123",
    "userId": {
      "_id": "user123",
      "username": "John Doe",
      "email": "john@example.com",
      "avatar": "https://..."
    },
    "eventId": {
      "_id": "event123",
      "name": "Beach Cleanup",
      "description": "...",
      "location": "Nha Trang Beach"
    },
    "status": "confirmed",
    "registerAt": "2025-11-01T10:00:00Z"
  }
}
```

---

## 9. Bookmarks

### 9.1. Thêm Event Vào Bookmark

```http
POST /api/events/:eventId/bookmarks
```

**Headers:** Authorization required

**Response Success (200):**

```json
{
  "success": true,
  "message": "Event bookmarked successfully"
}
```

---

### 9.2. Xóa Event Khỏi Bookmark

```http
DELETE /api/events/:eventId/bookmarks
```

**Headers:** Authorization required

**Response Success (200):**

```json
{
  "success": true,
  "message": "Bookmark removed successfully"
}
```

---

### 9.3. Lấy Danh Sách Events Đã Bookmark

```http
GET /api/users/bookmarks
```

**Headers:** Authorization required

**Response:** Xem mục [2.6. Lấy Events Đã Bookmark](#26-lấy-events-đã-bookmark)

---

## 10. Notifications

### 10.1. Lấy Tất Cả Thông Báo

```http
GET /api/notifications?page=1&limit=20&isRead=false
```

**Headers:** Authorization required

**Query Parameters:**

- `page` (optional): Số trang, mặc định = 1
- `limit` (optional): Số items/trang, mặc định = 20
- `isRead` (optional): true/false - Filter theo trạng thái đã đọc

**Response Success (200):**

```json
{
  "success": true,
  "notifications": [
    {
      "_id": "notif123",
      "sender": {
        "_id": "user456",
        "username": "Jane Smith",
        "avatar": "https://..."
      },
      "recipient": "user123",
      "type": "like",
      "content": "Jane Smith liked your post",
      "post": {
        "_id": "post123",
        "title": "My volunteer experience"
      },
      "event": {
        "_id": "event123",
        "name": "Beach Cleanup"
      },
      "isRead": false,
      "createdAt": "2025-11-16T12:00:00Z"
    },
    {
      "_id": "notif124",
      "sender": {
        "_id": "manager123",
        "username": "Manager Name",
        "avatar": "https://..."
      },
      "recipient": "user123",
      "type": "registration_status_update",
      "relatedStatus": "confirmed",
      "content": "Your registration for Beach Cleanup has been confirmed",
      "event": {
        "_id": "event123",
        "name": "Beach Cleanup"
      },
      "isRead": false,
      "createdAt": "2025-11-16T11:30:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalNotifications": 55,
    "limit": 20
  },
  "unreadCount": 15
}
```

**Notification Types:**

- `like`: Có người like post/comment/event của bạn
- `comment`: Có người comment vào post của bạn
- `comment_reply`: Có người reply comment của bạn
- `new_post`: Có post mới trong event bạn quan tâm
- `event_status_update`: Trạng thái event của bạn thay đổi
- `registration_status_update`: Trạng thái đăng ký của bạn thay đổi

---

### 10.2. Lấy Số Lượng Thông Báo Chưa Đọc

```http
GET /api/notifications/unread/count
```

**Headers:** Authorization required

**Response Success (200):**

```json
{
  "success": true,
  "unreadCount": 15
}
```

---

### 10.3. Đánh Dấu 1 Thông Báo Là Đã Đọc

```http
PATCH /api/notifications/:notificationId/read
```

**Headers:** Authorization required

**Response Success (200):**

```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

### 10.4. Đánh Dấu Tất Cả Thông Báo Là Đã Đọc

```http
PATCH /api/notifications/read-all
```

**Headers:** Authorization required

**Response Success (200):**

```json
{
  "success": true,
  "message": "All notifications marked as read",
  "modifiedCount": 15
}
```

---

### 10.5. Xóa 1 Thông Báo

```http
DELETE /api/notifications/:notificationId
```

**Headers:** Authorization required

**Response Success (200):**

```json
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

---

### 10.6. Xóa Tất Cả Thông Báo

```http
DELETE /api/notifications
```

**Headers:** Authorization required

**Response Success (200):**

```json
{
  "success": true,
  "message": "All notifications deleted successfully",
  "deletedCount": 55
}
```

---

## 11. Search

### 11.1. Tìm Kiếm Events

```http
GET /api/search/events?keyword=volunteer&category=environment&location=hanoi&sort=newest&page=1&limit=10
```

**Query Parameters:**

- `keyword` (optional): Từ khóa tìm kiếm
- `category` (optional): Slug của category
- `location` (optional): Địa điểm
- `startDate` (optional): Lọc events bắt đầu từ ngày này (YYYY-MM-DD)
- `endDate` (optional): Lọc events kết thúc trước ngày này (YYYY-MM-DD)
- `status` (optional): pending, approved, rejected, cancelled, completed
- `sort` (optional): relevance, newest, upcoming, popular, trending (mặc định: newest)
- `page` (optional): Số trang
- `limit` (optional): Số items/trang

**Response Success (200):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "event123",
      "name": "Beach Cleanup Drive",
      "description": "...",
      "location": "Nha Trang Beach",
      "categories": [...],
      "startDate": "2025-11-15T08:00:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50
  }
}
```

---

### 11.2. Tìm Kiếm Users (Admin Only)

```http
GET /api/search/users?q=john&role=user&page=1&limit=10
```

**Headers:** Authorization required (Admin only)

**Query Parameters:**

- `q` (optional): Từ khóa tìm kiếm (name or email)
- `role` (optional): user, manager, admin
- `page` (optional): Số trang
- `limit` (optional): Số items/trang

**Response Success (200):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "user123",
      "username": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "status": "active"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 2,
    "totalItems": 15
  }
}
```

---

### 11.3. Tìm Kiếm Posts Trong Event

```http
GET /api/search/events/:eventId/posts?q=experience&page=1&limit=10
```

**Query Parameters:**

- `q` (optional): Từ khóa tìm kiếm trong title/content
- `page` (optional): Số trang
- `limit` (optional): Số items/trang

**Response Success (200):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "post123",
      "title": "My volunteer experience",
      "content": "...",
      "author": {...}
    }
  ],
  "pagination": {...}
}
```

---

### 11.4. Tìm Kiếm Nâng Cao

```http
GET /api/search/advanced?q=volunteer&page=1&limit=10
```

**Query Parameters:**

- `q` (required): Từ khóa tìm kiếm
- `page` (optional): Số trang
- `limit` (optional): Số items/trang

**Response Success (200):**

```json
{
  "success": true,
  "data": {
    "events": [...],
    "posts": [...],
    "users": [...]
  }
}
```

---

## 12. Dashboard

### 12.1. Dashboard Của Manager

```http
GET /api/dashboard/manager
```

**Headers:** Authorization required (Manager role)

**Response Success (200):**

```json
{
  "success": true,
  "data": {
    "totalEvents": 25,
    "totalRegistrations": 450,
    "pendingEvents": 3,
    "approvedEvents": 20,
    "completedEvents": 2,
    "recentEvents": [
      {
        "_id": "event123",
        "name": "Beach Cleanup",
        "status": "approved",
        "registrationsCount": 30,
        "startDate": "2025-11-15T08:00:00Z"
      }
    ]
  }
}
```

---

### 12.2. Dashboard Của Admin

```http
GET /api/dashboard/admin
```

**Headers:** Authorization required (Admin role)

**Response Success (200):**

```json
{
  "success": true,
  "data": {
    "totalUsers": 1500,
    "totalManagers": 50,
    "totalEvents": 350,
    "totalRegistrations": 5000,
    "pendingEvents": 15,
    "systemStats": {
      "activeUsers": 1200,
      "lockedUsers": 5,
      "eventsThisMonth": 45,
      "registrationsThisMonth": 600
    }
  }
}
```

---

## 13. Admin APIs

**Note:** Tất cả Admin APIs đều yêu cầu role `admin`

### 13.1. Tạo Category

```http
POST /api/admin/categories
```

**Headers:** Authorization required (Admin)

**Body:**

```json
{
  "name": "Environment",
  "slug": "environment",
  "description": "Environmental protection and conservation activities",
  "color": "#4caf50"
}
```

**Response Success (201):**

```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "_id": "cat123",
    "name": "Environment",
    "slug": "environment",
    "description": "Environmental protection and conservation activities",
    "color": "#4caf50",
    "createdAt": "2025-11-01T00:00:00Z"
  }
}
```

---

### 13.2. Cập Nhật Category

```http
PUT /api/admin/categories/:id
```

**Headers:** Authorization required (Admin)

**Body:**

```json
{
  "name": "Environmental Protection",
  "slug": "environmentalprotection",
  "description": "Updated description",
  "color": "#2196f3"
}
```

**Response Success (200):**

```json
{
  "success": true,
  "message": "Category updated successfully"
}
```

---

### 13.3. Lấy Danh Sách Events Chờ Duyệt

```http
GET /api/admin/events/pending
```

**Headers:** Authorization required (Admin)

**Response Success (200):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "event123",
      "name": "Beach Cleanup",
      "description": "...",
      "status": "pending",
      "managerId": {
        "_id": "manager123",
        "username": "Manager Name"
      },
      "createdAt": "2025-11-01T00:00:00Z"
    }
  ]
}
```

---

### 13.4. Cập Nhật Trạng Thái Event

```http
PATCH /api/admin/events/:id/status
```

**Headers:** Authorization required (Admin)

**Body:**

```json
{
  "status": "approved"
}
```

**Status Values:**

- `approved`: Chấp nhận
- `rejected`: Từ chối
- `cancelled`: Hủy
- `completed`: Hoàn thành

**Response Success (200):**

```json
{
  "success": true,
  "message": "Event status updated successfully"
}
```

---

### 13.5. Xóa Event

```http
DELETE /api/admin/events/:id
```

**Headers:** Authorization required (Admin)

**Response Success (200):**

```json
{
  "success": true,
  "message": "Event deleted successfully"
}
```

---

### 13.6. Lấy Danh Sách Tất Cả Users

```http
GET /api/admin/users
```

**Headers:** Authorization required (Admin)

**Response Success (200):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "user123",
      "username": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "status": "active",
      "createdAt": "2025-10-01T00:00:00Z"
    }
  ]
}
```

---

### 13.7. Tạo User Mới (Admin)

```http
POST /api/admin/users
```

**Headers:** Authorization required (Admin)

**Body:**

```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "phoneNumber": "0123456789",
  "password": "password123",
  "role": "manager"
}
```

**Field Validation:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| username | string | Yes | Alphanumeric, 3-30 characters |
| email | string | Yes | Valid email format |
| phoneNumber | string | Yes | Exactly 10 digits |
| password | string | Yes | Minimum 6 characters |
| role | string | Yes | "user" or "manager" |

**Response Success (201):**

```json
{
  "success": true,
  "message": "User created successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com",
    "phoneNumber": "0123456789",
    "avatar": "https://ui-avatars.com/api/?name=johndoe&background=random",
    "role": "manager",
    "status": "active"
  }
}
```

**Errors:**

- `400`: Email or phone number already in use
- `403`: Forbidden - Admin role required

---

### 13.8. Khóa/Mở Khóa User

```http
PATCH /api/admin/users/:userId/lock
```

**Headers:** Authorization required (Admin)

**Response Success (200):**

```json
{
  "success": true,
  "message": "User account locked successfully"
}
```

**Note:** Gọi lại API này sẽ mở khóa user

---

### 13.9. Export Users Data (CSV)

```http
GET /api/admin/export/users
```

**Headers:** Authorization required (Admin)

**Response:** File CSV chứa dữ liệu users

---

### 13.10. Export Events Data (CSV))

```http
GET /api/admin/export/events
```

**Headers:** Authorization required (Admin)

**Response:** File CSV chứa dữ liệu events

---

### 13.11. Xóa Category

```http
DELETE /api/admin/categories/:id
```

**Headers:** Authorization required (Admin)

**Response Success (200):**

```json
{
  "success": true,
  "message": "Category deleted successfully"
}
```

**Errors:**

- `404`: Category not found

---

## 14. Manager APIs

**Note:** Tất cả Manager APIs đều yêu cầu role `manager` hoặc `admin`

### 14.1. Tạo Event Mới

```http
POST /api/manager/events
```

**Headers:** Authorization required (Manager)

**Body:**

```json
{
  "name": "Beach Cleanup Drive",
  "description": "Join us to clean up the local beach",
  "location": "Nha Trang Beach, Vietnam",
  "startDate": "2025-11-15T08:00:00Z",
  "endDate": "2025-11-15T18:00:00Z",
  "categories": ["6123456789abcdef01234567"],
  "capacity": 50,
  "thumbnail": "https://example.com/thumbnail.jpg",
  "images": ["https://example.com/img1.jpg", "https://example.com/img2.jpg"]
}
```

**Response Success (201):**

```json
{
  "success": true,
  "message": "Event created successfully",
  "data": {
    "_id": "event123",
    "name": "Beach Cleanup Drive",
    "description": "Join us to clean up the local beach",
    "location": "Nha Trang Beach, Vietnam",
    "startDate": "2025-11-15T08:00:00Z",
    "endDate": "2025-11-15T18:00:00Z",
    "categories": ["6123456789abcdef01234567"],
    "capacity": 50,
    "status": "pending",
    "managerId": "manager123",
    "thumbnail": "https://example.com/thumbnail.jpg",
    "images": ["https://example.com/img1.jpg"],
    "createdAt": "2025-11-01T00:00:00Z"
  }
}
```

---

### 14.2. Lấy Tất Cả Events Của Manager

```http
GET /api/manager/events
```

**Headers:** Authorization required (Manager)

**Response Success (200):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "event123",
      "name": "Beach Cleanup",
      "status": "approved",
      "registrationsCount": 30,
      "capacity": 50,
      "startDate": "2025-11-15T08:00:00Z"
    }
  ]
}
```

---

### 14.3. Cập Nhật Event

```http
PUT /api/manager/events/:id
```

**Headers:** Authorization required (Manager - chỉ manager tạo event mới update được)

**Body:**

```json
{
  "name": "Beach Cleanup Drive - Updated",
  "description": "Updated description...",
  "location": "Nha Trang Beach, Vietnam",
  "startDate": "2025-11-15T08:00:00Z",
  "endDate": "2025-11-15T18:00:00Z",
  "capacity": 60,
  "categories": ["6123456789abcdef01234567"],
  "thumbnail": "https://example.com/new-thumbnail.jpg",
  "images": ["https://example.com/img1.jpg"]
}
```

**Response Success (200):**

```json
{
  "success": true,
  "message": "Event updated successfully"
}
```

---

### 14.4. Xóa Event

```http
DELETE /api/manager/events/:id
```

**Headers:** Authorization required (Manager - chỉ manager tạo event mới xóa được)

**Response Success (200):**

```json
{
  "success": true,
  "message": "Event deleted successfully"
}
```

---

### 14.5. Lấy Thống Kê Tổng Số Volunteers

```http
GET /api/manager/stats/volunteers
```

**Headers:** Authorization required (Manager)

**Response Success (200):**

```json
{
  "success": true,
  "data": {
    "totalConfirmedVolunteers": 450
  }
}
```

---

### 14.6. Lấy Danh Sách Volunteers Của Event

```http
GET /api/manager/events/:eventId/volunteers
```

**Headers:** Authorization required (Manager)

**Response Success (200):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "reg123",
      "userId": {
        "_id": "user123",
        "username": "John Doe",
        "email": "john@example.com",
        "phone_number": "0123456789",
        "avatar": "https://..."
      },
      "eventId": "event123",
      "status": "confirmed",
      "registerAt": "2025-11-01T10:00:00Z"
    }
  ]
}
```

---

### 14.7. Cập Nhật Trạng Thái Registration

```http
PATCH /api/manager/registrations/:registrationId/status
```

**Headers:** Authorization required (Manager)

**Body:**

```json
{
  "status": "confirmed"
}
```

**Status Values:**

- `confirmed`: Xác nhận
- `completed`: Hoàn thành
- `cancelled`: Hủy

**Response Success (200):**

```json
{
  "success": true,
  "message": "Registration status updated successfully"
}
```

---

### 14.8. Lấy Registrations Theo Status

```http
GET /api/manager/registrations?status=pending&page=1&limit=10
```

**Headers:** Authorization required (Manager)

**Query Parameters:**

- `status` (optional): pending, confirmed, completed, cancelled
- `page` (optional): Số trang
- `limit` (optional): Số items/trang

**Response Success (200):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "reg123",
      "userId": {
        "_id": "user123",
        "username": "John Doe",
        "email": "john@example.com"
      },
      "eventId": {
        "_id": "event123",
        "name": "Beach Cleanup"
      },
      "status": "pending",
      "registerAt": "2025-11-01T10:00:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 25
  }
}
```

---

## Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error message description"
}
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning               | Mô tả                                   |
| ---- | --------------------- | --------------------------------------- |
| 200  | OK                    | Request thành công                      |
| 201  | Created               | Tạo resource thành công                 |
| 400  | Bad Request           | Request không hợp lệ (validation error) |
| 401  | Unauthorized          | Chưa đăng nhập hoặc token không hợp lệ  |
| 403  | Forbidden             | Không có quyền truy cập                 |
| 404  | Not Found             | Resource không tồn tại                  |
| 429  | Too Many Requests     | Vượt quá rate limit                     |
| 500  | Internal Server Error | Lỗi server                              |

### Common Error Messages

**401 Unauthorized:**

```json
{
  "success": false,
  "message": "Unauthorized - No token provided"
}
```

**403 Forbidden:**

```json
{
  "success": false,
  "message": "Forbidden - Admin role required"
}
```

**404 Not Found:**

```json
{
  "success": false,
  "message": "Event not found"
}
```

**400 Validation Error:**

```json
{
  "success": false,
  "message": "Validation error: email is required"
}
```

**429 Rate Limit:**

```json
{
  "success": false,
  "message": "Too many requests, please try again later"
}
```

---

## Ví Dụ Sử Dụng Với Axios

### Setup

```javascript
import axios from 'axios';

// Cấu hình base URL
const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  withCredentials: true, // Cho phép gửi cookie
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để tự động thêm token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor để xử lý lỗi
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Ví Dụ Sử Dụng

#### 1. Đăng Nhập

```javascript
const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', {
      email,
      password,
    });

    // Lưu token
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));

    return response.data;
  } catch (error) {
    console.error('Login error:', error.response?.data?.message);
    throw error;
  }
};
```

#### 2. Lấy Danh Sách Events

```javascript
const getEvents = async (page = 1, limit = 10) => {
  try {
    const response = await api.get('/events', {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    console.error('Get events error:', error);
    throw error;
  }
};
```

#### 3. Tạo Post

```javascript
const createPost = async (eventId, postData) => {
  try {
    const response = await api.post(`/events/${eventId}/posts`, postData);
    return response.data;
  } catch (error) {
    console.error('Create post error:', error.response?.data?.message);
    throw error;
  }
};
```

#### 4. Đăng Ký Event

```javascript
const registerForEvent = async (eventId) => {
  try {
    const response = await api.post(`/events/${eventId}/register`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 400) {
      console.error('Already registered or event is full');
    }
    throw error;
  }
};
```

#### 5. Lấy Thông Báo

```javascript
const getNotifications = async (page = 1, isRead = null) => {
  try {
    const params = { page, limit: 20 };
    if (isRead !== null) {
      params.isRead = isRead;
    }

    const response = await api.get('/notifications', { params });
    return response.data;
  } catch (error) {
    console.error('Get notifications error:', error);
    throw error;
  }
};
```

#### 6. Search Events

```javascript
const searchEvents = async (filters) => {
  try {
    const response = await api.get('/search/events', {
      params: {
        keyword: filters.keyword,
        category: filters.category,
        location: filters.location,
        sort: filters.sort || 'newest',
        page: filters.page || 1,
        limit: filters.limit || 10,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
};
```

---

## Tips & Best Practices

### 1. Authentication

- Luôn check token expiration
- Implement refresh token nếu cần
- Clear token khi logout

### 2. Error Handling

- Luôn wrap API calls trong try-catch
- Hiển thị error messages rõ ràng cho user
- Log errors để debug

### 3. Loading States

```javascript
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

const fetchData = async () => {
  setLoading(true);
  setError(null);
  try {
    const data = await api.get('/events');
    // Handle data
  } catch (err) {
    setError(err.response?.data?.message || 'An error occurred');
  } finally {
    setLoading(false);
  }
};
```

### 4. Pagination

```javascript
const [currentPage, setCurrentPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);

const loadMore = () => {
  if (currentPage < totalPages) {
    setCurrentPage(currentPage + 1);
  }
};
```

### 5. Real-time Updates

- Implement polling cho notifications
- Có thể sử dụng WebSocket cho real-time updates (nếu backend support)

```javascript
// Polling example
useEffect(() => {
  const interval = setInterval(() => {
    fetchUnreadCount();
  }, 30000); // 30 seconds

  return () => clearInterval(interval);
}, []);
```

---

## Liên Hệ & Support

Nếu có vấn đề hoặc câu hỏi, vui lòng liên hệ:

- Email: tot23032@gmail.com
- Swagger Documentation: http://localhost:4000/api-docs

---

**Version:** 1.0.0  
**Last Updated:** November 3, 2025
