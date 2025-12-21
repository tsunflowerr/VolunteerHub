# 🤝 VolunteerHub

> Nền tảng quản lý tình nguyện viên toàn diện - Kết nối người tổ chức và tình nguyện viên, theo dõi hoạt động, xây dựng cộng đồng tình nguyện mạnh mẽ.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-brightgreen.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## 🌟 Giới Thiệu

**VolunteerHub** là nền tảng quản lý tình nguyện viên hiện đại với hệ thống phân quyền 3 cấp (User, Manager, Admin), tích hợp gamification, thông báo real-time, và analytics dashboard.

**Tính năng nổi bật:**
- 🔐 Authentication JWT với phân quyền đa cấp
- 📅 Quản lý sự kiện đầy đủ (CRUD, approval workflow, categories)
- 📝 Đăng ký tham gia với tracking trạng thái
- 💬 Social features (posts, comments, likes, bookmarks)
- 🏆 Gamification system (points, levels, achievements, leaderboard)
- 🔔 Web push notifications & in-app notifications
- 📊 Dashboard & analytics cho từng role
- 🔍 Full-text search với advanced filtering
- 📤 Export dữ liệu CSV

---

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express.js** 5.1.0 - Web framework
- **MongoDB** + **Mongoose** 8.19.1 - Database & ODM
- **Redis** 5.8.3 - Caching & rate limiting
- **JWT** 9.0.2 + **bcrypt** 6.0.0 - Authentication
- **Joi** 18.0.1 - Validation
- **web-push** 3.6.7 - Push notifications
- **Cloudinary** 1.41.3 - Image storage
- **node-cron** 4.2.1 - Scheduled tasks
- **Swagger** - API documentation
- **Helmet** + **CORS** - Security

### Frontend
- **React** 19.1.1 + **Vite** 7.1.7 - UI framework & build tool
- **React Router** 7.9.4 - Routing
- **TanStack Query** 5.90.11 - Data fetching & caching
- **Axios** 1.13.2 - HTTP client
- **Recharts** 3.4.1 - Data visualization
- **Framer Motion** 12.23.24 + **AOS** 2.3.4 - Animations
- **Radix UI** 1.1.15 - UI components
- **Lucide React** 0.546.0 - Icons
- **Yup** 1.7.1 + **date-fns** 4.1.0 - Validation & utilities

### DevOps
- **Docker** & **Docker Compose** - Containerization
- **Nodemon** - Development auto-reload
- **ESLint** - Code linting

---

## 🚀 Cài Đặt

### Yêu Cầu
- Node.js 18+
- MongoDB 5+
- Redis 6+

### Backend

```bash
cd backend
npm install

# Tạo file .env
PORT=4000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/volunteerhub
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key

npm start  # http://localhost:4000
```

### Frontend

```bash
cd frontend
npm install

# Tạo file .env
VITE_API_URL=http://localhost:4000/api
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key

npm run dev  # http://localhost:5173
```

### Docker (Recommended)

```bash
docker-compose up -d           # Khởi động
docker-compose logs -f         # Xem logs
docker-compose down            # Dừng
```

---

## 📚 API Documentation

**Swagger UI:** `http://localhost:4000/api-docs`

**Base URL:** `http://localhost:4000/api`

**Authentication:** JWT qua Cookie (recommended) hoặc `Authorization: Bearer <token>`

**Rate Limits:**
- Auth: 5 req/15min
- Registration: 3 req/15min
- Search: 50 req/15min
- General: 100 req/15min

Chi tiết đầy đủ tại [backend/API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md)

---

## 🔒 Bảo Mật

- JWT authentication với bcrypt password hashing
- Role-based access control (RBAC)
- Helmet.js security headers
- Redis-backed rate limiting
- Joi schema validation
- XSS protection & MongoDB injection prevention
- CORS configuration
- Secure cookies & environment variables

---

## 📝 License

MIT License

---

## 👨‍💻 Tác Giả

**tsunflowerr**
- GitHub: [@tsunflowerr](https://github.com/tsunflowerr)
- Repository: [VolunteerHub](https://github.com/tsunflowerr/VolunteerHub)

---

**Made with ❤️ by tsunflowerr**
