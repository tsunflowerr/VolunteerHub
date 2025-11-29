/**
 * BƯỚC 14: Hướng dẫn kết nối API thật
 */

# Để kết nối với Backend API thật:

## 1. Đảm bảo Backend đang chạy:
```bash
cd VolunteerHub-thanh/sever-side
docker-compose up -d
```

## 2. Trong từng component, thay đổi từ mock sang API:

### EventsTable.jsx:
```javascript
// Thay thế phần useEffect:
useEffect(() => {
  const fetchEvents = async () => {
    try {
      setLoading(true)
      const data = await api.getEvents()
      setEvents(data.data || data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  fetchEvents()
}, [])

// Trong handleApprove:
await api.approveEvent(eventId)

// Trong handleReject:
await api.rejectEvent(eventId)

// Trong handleDelete:
await api.deleteEvent(eventId)
```

### UsersTable.jsx:
```javascript
// Trong useEffect:
const data = await api.getUsers()
setUsers(data.data || data)

// Trong handleToggleLock:
await api.toggleLockUser(userId)

// Trong handleDelete:
await api.deleteUser(userId)
```

### CategoriesTable.jsx:
```javascript
// Trong useEffect:
const data = await api.getCategories()
setCategories(data.data || data)

// Trong handleSubmit (create):
await api.createCategory(formData)

// Trong handleSubmit (update):
await api.updateCategory(editingId, formData)

// Trong handleDelete:
await api.deleteCategory(categoryId)
```

### Login.jsx:
```javascript
// Bỏ comment dòng này trong handleSubmit:
const data = await api.login(formData)
login(data.user, data.token)
navigate('/admin')
```

## 3. Import api helper:
```javascript
import api from '../../utils/api'
```

## 4. Xử lý lỗi:
- Nếu token hết hạn → Tự động redirect về login
- Hiển thị error message phù hợp

## LƯU Ý:
- Mock data hiện tại dùng để học và test UI
- Khi backend ready, chỉ cần uncomment code API là xong!
- Tất cả logic đã được chuẩn bị sẵn
