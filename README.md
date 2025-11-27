# VolunteerHub 🤝

Nền tảng quản lý tình nguyện viên được xây dựng với Node.js/Express (Backend) và React/Vite (Frontend).

---

## 📁 Cấu trúc dự án

```
VolunteerHub/
├── frontend/          # React + Vite frontend
├── sever-side/        # Node.js + Express backend
└── README.md
```

---

## ✨ Tính năng chính

### Backend
- 🔐 **Xác thực JWT** với hệ thống phân quyền 3 cấp (User, Manager, Admin)
- 📅 **Quản lý sự kiện** với CRUD đầy đủ, phân loại, trạng thái và phê duyệt
- 📝 **Đăng ký tình nguyện** với quản lý trạng thái và kiểm soát capacity
- 📰 **Tương tác xã hội** với posts, comments, likes và bookmarks
- 🔔 **Hệ thống thông báo** thời gian thực với web push notifications
- 🔍 **Tìm kiếm nâng cao** với full-text search và filtering
- 📊 **Dashboard và analytics** cho Users, Managers và Admins
- 📤 **Export dữ liệu** sang CSV (users, events, registrations)

### Frontend
- 🏠 **Trang chủ** với banner, event list, partner slider
- 📋 **Quản lý sự kiện** với tìm kiếm, lọc, chi tiết sự kiện
- 👤 **Hồ sơ người dùng** với quản lý thông tin cá nhân
- 📝 **Đăng ký sự kiện** với form và preview
- 🎛️ **Manager Dashboard** với thống kê, biểu đồ, quản lý volunteers

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js v5.1.0
- **Database**: MongoDB với Mongoose v8.19.1
- **Cache**: Redis v5.8.3
- **Authentication**: JWT v9.0.2, bcrypt
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Joi v18.0.1
- **Notifications**: web-push v3.6.7
- **Documentation**: Swagger

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite 7
- **Styling**: CSS Modules
- **Charts**: Recharts
- **Animation**: Framer Motion, AOS
- **UI Components**: Radix UI, Lucide React
- **Routing**: React Router v7

---

## 🚀 Cài đặt

### Backend

1. **Di chuyển vào thư mục backend**
   ```bash
   cd sever-side
   ```

2. **Cài đặt dependencies**
   ```bash
   npm install
   ```

3. **Tạo file `.env`**
   ```env
   PORT=4000
   CLIENT_URL=http://localhost:5173
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/volunteerhub
   REDIS_URL=redis://localhost:6379
   JWT_SECRET=your_secret_key
   VAPID_PUBLIC_KEY=your_vapid_public_key
   VAPID_PRIVATE_KEY=your_vapid_private_key
   ```

4. **Khởi động server**
   ```bash
   npm start
   ```
   Server chạy tại `http://localhost:4000`

5. **API Documentation**
   ```
   http://localhost:4000/api-docs
   ```

### Frontend

1. **Di chuyển vào thư mục frontend**
   ```bash
   cd frontend
   ```

2. **Cài đặt dependencies**
   ```bash
   npm install
   ```

3. **Khởi động development server**
   ```bash
   npm run dev
   ```
   Frontend chạy tại `http://localhost:5173`

---

## 🐳 Docker Deployment

```bash
# Khởi động với Docker Compose
docker-compose up -d

# Xem logs
docker-compose logs -f backend

# Dừng services
docker-compose down
```

---

## 📚 API Documentation

### Base URL
```
http://localhost:4000/api
```

### Authentication
- JWT token qua Cookie (khuyến nghị) hoặc Authorization Header
- Format: `Authorization: Bearer <token>`

### Rate Limiting
- API Endpoints: 100 requests/15 phút
- Auth Endpoints: 5 requests/15 phút
- Registration: 3 requests/15 phút
- Search: 50 requests/15 phút

---

## 🔒 Bảo mật

- ✅ JWT authentication với bcrypt password hashing
- ✅ Role-based access control (RBAC)
- ✅ Helmet.js security headers
- ✅ Redis-backed rate limiting
- ✅ Joi schema validation
- ✅ XSS protection và MongoDB injection prevention
- ✅ CORS configuration
- ✅ Secure cookie settings

---

## 👨‍💻 Tác giả

**tsunflowerr**

- GitHub: [@tsunflowerr](https://github.com/tsunflowerr)
- Repository: [VolunteerHub](https://github.com/tsunflowerr/VolunteerHub)

---

## 📝 License

MIT License

---

**Made with ❤️ by tsunflowerr**
