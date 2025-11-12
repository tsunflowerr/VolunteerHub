# VolunteerHub API 🤝

Nền tảng quản lý tình nguyện viên được xây dựng với Node.js và Express, hỗ trợ quản lý sự kiện, đăng ký tình nguyện, tương tác xã hội và thông báo thời gian thực.

---

## ✨ Tính năng chính

- 🔐 **Xác thực JWT** với hệ thống phân quyền 3 cấp (User, Manager, Admin)
- 📅 **Quản lý sự kiện** với CRUD đầy đủ, phân loại, trạng thái và phê duyệt
- 📝 **Đăng ký tình nguyện** với quản lý trạng thái và kiểm soát capacity
- 📰 **Tương tác xã hội** với posts, comments, likes và bookmarks
- 🔔 **Hệ thống thông báo** thời gian thực với web push notifications
- 🔍 **Tìm kiếm nâng cao** với full-text search và filtering
- 📊 **Dashboard và analytics** cho Users, Managers và Admins
- 📤 **Export dữ liệu** sang CSV (users, events, registrations)

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js v5.1.0
- **Database**: MongoDB với Mongoose v8.19.1
- **Cache**: Redis v5.8.3
- **Authentication**: JWT v9.0.2, bcrypt
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Joi v18.0.1
- **Notifications**: web-push v3.6.7
- **Documentation**: Swagger

---

## 🚀 Cài đặt

### Yêu cầu
- Node.js (v16+)
- MongoDB
- Redis
- npm hoặc yarn

### Các bước cài đặt

1. **Clone repository**
   ```bash
   git clone https://github.com/tsunflowerr/VolunteerHub.git
   cd VolunteerHub/sever-side
   ```

2. **Cài đặt dependencies**
   ```bash
   npm install
   ```

3. **Tạo file `.env`**
   ```env
   PORT=4000
   CLIENT_URL=http://localhost:3000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/volunteerhub
   REDIS_URL=redis://localhost:6379
   JWT_SECRET=your_secret_key
   VAPID_PUBLIC_KEY=your_vapid_public_key
   VAPID_PRIVATE_KEY=your_vapid_private_key
   ```

4. **Generate VAPID keys** (tùy chọn)
   ```bash
   npx web-push generate-vapid-keys
   ```

5. **Khởi động server**
   ```bash
   npm start
   ```

   Server chạy tại `http://localhost:4000`

6. **Truy cập API Documentation**
   ```
   http://localhost:4000/api-docs
   ```

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

### Swagger Documentation
Chi tiết đầy đủ tại: `http://localhost:4000/api-docs`

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
