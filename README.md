# 🤝 VolunteerHub

> **Nền tảng kết nối và quản lý hoạt động tình nguyện toàn diện.**
> Xây dựng cộng đồng, lan tỏa yêu thương.

🔗 **Live Demo:** [https://volunteer-hub-mauve.vercel.app](https://volunteer-hub-mauve.vercel.app)
🔗 **API Backend:** [https://volunteerhub-xa0m.onrender.com](https://volunteerhub-xa0m.onrender.com)
📚 **API Docs:** [https://volunteerhub-xa0m.onrender.com/api-docs](https://volunteerhub-xa0m.onrender.com/api-docs)

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg?logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-blue.svg?logo=react)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-brightgreen.svg?logo=mongodb)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-Latest-red.svg?logo=redis)](https://redis.io/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## 📖 Mục lục

- [Giới Thiệu](#-giới-thiệu)
- [Tính Năng Chính](#-tính-năng-chính)
- [Công Nghệ Sử Dụng](#-công-nghệ-sử-dụng)
- [Cài Đặt & Chạy Dự Án](#-cài-đặt--chạy-dự-án)
- [Cấu Hình Biến Môi Trường](#-cấu-hình-biến-môi-trường)
- [API Documentation](#-api-documentation)
- [Bảo Mật](#-bảo-mật)
- [Tác Giả](#-tác-giả)

---

## 🌟 Giới Thiệu

**VolunteerHub** là một giải pháp phần mềm hiện đại được thiết kế để đơn giản hóa quy trình tổ chức và tham gia các hoạt động tình nguyện. Hệ thống cung cấp nền tảng tập trung cho phép các tổ chức (Managers) tạo sự kiện, và các tình nguyện viên (Users) dễ dàng tìm kiếm, đăng ký và theo dõi hành trình đóng góp của mình.

Dự án chú trọng vào trải nghiệm người dùng (UX) mượt mà, hiệu năng cao và tính tương tác thông qua hệ thống Gamification và Mạng xã hội nội bộ.

---

## 🚀 Tính Năng Chính

### 👤 User (Tình nguyện viên)

- **Khám phá sự kiện:** Tìm kiếm nâng cao theo từ khóa, địa điểm, thời gian, danh mục.
- **Đăng ký tham gia:** Quy trình đăng ký đơn giản, theo dõi trạng thái (Pending, Approved, Completed).
- **Tương tác xã hội:** Thảo luận, bình luận, like bài viết, lưu sự kiện (Bookmark).
- **Gamification:** Tích điểm, thăng cấp, mở khóa danh hiệu (Achievements), xem Bảng xếp hạng (Leaderboard).
- **Thông báo:** Nhận thông báo Real-time và Web Push về trạng thái đăng ký, sự kiện mới.
- **Hồ sơ cá nhân:** Quản lý thông tin, lịch sử hoạt động, thống kê giờ tình nguyện.

### 🏢 Manager (Người tổ chức)

- **Quản lý sự kiện:** Tạo, sửa, xóa sự kiện. Tùy chỉnh form đăng ký.
- **Quản lý tình nguyện viên:** Duyệt/Từ chối đơn đăng ký, điểm danh (Check-in), đánh giá sau sự kiện.
- **Thống kê:** Xem báo cáo về số lượng người tham gia, mức độ quan tâm.

### 🛡️ Admin (Quản trị viên)

- **Dashboard tổng quan:** Thống kê toàn hệ thống (Users, Events, Traffic).
- **Quản lý người dùng:** Phân quyền, khóa tài khoản vi phạm.
- **Quản lý danh mục:** CRUD danh mục sự kiện.
- **Hệ thống báo cáo:** Xử lý các báo cáo vi phạm nội dung.

---

## 🛠️ Công Nghệ Sử Dụng

Dự án được xây dựng trên nền tảng **MERN Stack** hiện đại và tối ưu hóa hiệu năng.

### Backend (`/backend`)

| Công nghệ                   | Mục đích                         |
| :-------------------------- | :------------------------------- |
| **Node.js** & **Express 5** | RESTful API Framework            |
| **MongoDB** & **Mongoose**  | Cơ sở dữ liệu NoSQL & ODM        |
| **Redis**                   | Caching, Rate Limiting & Session |
| **JWT** & **Bcrypt**        | Xác thực & Mã hóa bảo mật        |
| **Web Push**                | Thông báo đẩy trình duyệt        |
| **Cloudinary**              | Lưu trữ hình ảnh tối ưu          |
| **Node-cron**               | Tác vụ định kỳ (Scheduled Tasks) |
| **Swagger**                 | Tài liệu hóa API tự động         |

### Frontend (`/frontend`)

| Công nghệ                      | Mục đích                       |
| :----------------------------- | :----------------------------- |
| **React 19**                   | Thư viện UI Core               |
| **Vite**                       | Build tool siêu tốc            |
| **TanStack Query**             | Quản lý Server State & Caching |
| **Zustand / Context**          | Quản lý Global State           |
| **React Router 7**             | Định tuyến (Routing)           |
| **Radix UI** & **CSS Modules** | Xây dựng giao diện & Styling   |
| **Framer Motion**              | Hiệu ứng chuyển động mượt mà   |
| **Lucide React**               | Bộ icon hiện đại               |

---

## 📥 Cài Đặt & Chạy Dự Án

### Yêu cầu tiên quyết

- [Node.js](https://nodejs.org/) (v18 trở lên)
- [MongoDB](https://www.mongodb.com/) (Local hoặc Atlas)
- [Redis](https://redis.io/) (Local hoặc Cloud)
- [Docker](https://www.docker.com/) (Tùy chọn)

### Cách 1: Chạy thủ công (Development)

#### 1. Khởi chạy Backend

```bash
cd backend
npm install
# Cấu hình .env (xem bên dưới)
npm start
# Server chạy tại: http://localhost:4000
```

#### 2. Khởi chạy Frontend

```bash
cd frontend
npm install
# Cấu hình .env (xem bên dưới)
npm run dev
# App chạy tại: http://localhost:5173
```

### Cách 2: Chạy bằng Docker (Recommended)

Chạy toàn bộ hệ thống (Frontend, Backend, MongoDB, Redis) chỉ với một lệnh:

```bash
docker-compose up -d --build
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`
- API Docs: `http://localhost:4000/api-docs`

---

## 🔑 Cấu Hình Biến Môi Trường

Tạo file `.env` trong thư mục tương ứng.

### Backend (`backend/.env`)

```env
PORT=4000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb://localhost:27017/volunteerhub
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET=your_super_secret_jwt_key_here

# Cloudinary (Image Upload)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Web Push Notifications
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:4000/api
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key
```

---

## 📚 API Documentation

Hệ thống tích hợp sẵn Swagger UI để tra cứu API.
Truy cập: **[http://localhost:4000/api-docs](http://localhost:4000/api-docs)**

**Quy định Rate Limit:**

- **Auth:** 5 requests / 15 phút
- **Đăng ký:** 3 requests / 15 phút
- **Tìm kiếm:** 50 requests / 15 phút

---

## 🔒 Bảo Mật

Chúng tôi áp dụng các tiêu chuẩn bảo mật cao:

- **Authentication:** JWT (JSON Web Token) được lưu trữ an toàn (HttpOnly Cookies recommended).
- **Authorization:** ABAC (Attribute-Based Access Control) kết hợp RBAC.
- **Validation:** Kiểm tra dữ liệu đầu vào chặt chẽ với Joi.
- **Protection:** Chống XSS, NoSQL Injection, Rate Limiting với Redis, Security Headers (Helmet).

---
