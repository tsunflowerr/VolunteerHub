import { useState, useEffect } from 'react'
import { Shield, ShieldOff, Trash2, Loader2, Search, Filter, UserPlus, CheckCircle2, XCircle } from 'lucide-react'
import './UsersTable.css'

/**
 * BƯỚC 11: Quản lý Người dùng
 * Tái sử dụng kiến thức từ EventsTable
 */

function UsersTable() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')

  // Fetch users data
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Mock data
        const mockUsers = [
          {
            _id: '1',
            fullName: 'Nguyễn Văn A',
            email: 'nguyenvana@example.com',
            role: 'user',
            isLocked: false,
            createdAt: '2025-01-15'
          },
          {
            _id: '2',
            fullName: 'Trần Thị B',
            email: 'tranthib@example.com',
            role: 'manager',
            isLocked: false,
            createdAt: '2025-02-20'
          },
          {
            _id: '3',
            fullName: 'Lê Văn C',
            email: 'levanc@example.com',
            role: 'user',
            isLocked: true,
            createdAt: '2025-03-10'
          },
          {
            _id: '4',
            fullName: 'Phạm Thị D',
            email: 'phamthid@example.com',
            role: 'user',
            isLocked: false,
            createdAt: '2025-04-05'
          }
        ]
        
        setUsers(mockUsers)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    
    fetchUsers()
  }, [])

  // Lock/Unlock user
  const handleToggleLock = async (userId, currentStatus) => {
    try {
      setActionLoading(userId)
      await new Promise(resolve => setTimeout(resolve, 800))
      
      setUsers(users.map(user => 
        user._id === userId 
          ? { ...user, isLocked: !currentStatus }
          : user
      ))
      
      alert(`✅ ${currentStatus ? 'Mở khóa' : 'Khóa'} tài khoản thành công!`)
    } catch (err) {
      alert('❌ Có lỗi xảy ra')
    } finally {
      setActionLoading(null)
    }
  }

  // Delete user
  const handleDelete = async (userId) => {
    if (!confirm('⚠️ Bạn có chắc chắn muốn xóa người dùng này?')) return
    
    try {
      setActionLoading(userId)
      await new Promise(resolve => setTimeout(resolve, 800))
      
      setUsers(users.filter(user => user._id !== userId))
      alert('✅ Đã xóa người dùng!')
    } catch (err) {
      alert('❌ Có lỗi xảy ra')
    } finally {
      setActionLoading(null)
    }
  }

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchSearch = 
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchRole = filterRole === 'all' || user.role === filterRole
    
    return matchSearch && matchRole
  })

  // Render role badge
  const renderRole = (role) => {
    const roleMap = {
      admin: { label: 'Quản trị viên', className: 'role-admin' },
      manager: { label: 'Quản lý', className: 'role-manager' },
      user: { label: 'Người dùng', className: 'role-user' }
    }
    const roleInfo = roleMap[role] || roleMap.user
    return <span className={`role-badge ${roleInfo.className}`}>{roleInfo.label}</span>
  }

  if (loading) {
    return <div className="loading">Đang tải dữ liệu...</div>
  }

  if (error) {
    return <div className="error">❌ Lỗi: {error}</div>
  }

  return (
    <div className="users-table-container">
      <div className="table-header">
        <h2>Danh sách Người dùng</h2>
        <button className="btn-primary">+ Tạo người dùng mới</button>
      </div>

      {/* Search and Filter */}
      <div className="table-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')}>✕</button>
          )}
        </div>

        <div className="filter-box">
          <label>Vai trò:</label>
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
            <option value="all">Tất cả</option>
            <option value="admin">Quản trị viên</option>
            <option value="manager">Quản lý</option>
            <option value="user">Người dùng</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <table>
        <thead>
          <tr>
            <th>STT</th>
            <th>Họ tên</th>
            <th>Email</th>
            <th>Vai trò</th>
            <th>Trạng thái</th>
            <th>Ngày tạo</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center' }}>
                {users.length === 0 ? 'Chưa có người dùng' : 'Không tìm thấy người dùng phù hợp'}
              </td>
            </tr>
          ) : (
            filteredUsers.map((user, index) => (
              <tr key={user._id}>
                <td>{index + 1}</td>
                <td>{user.fullName}</td>
                <td>{user.email}</td>
                <td>{renderRole(user.role)}</td>
                <td>
                  <span className={user.isLocked ? 'status-locked' : 'status-active'}>
                    {user.isLocked ? 'Đã khóa' : 'Hoạt động'}
                  </span>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className={user.isLocked ? 'btn-unlock' : 'btn-lock'}
                      onClick={() => handleToggleLock(user._id, user.isLocked)}
                      disabled={actionLoading === user._id}
                      title={user.isLocked ? 'Mở khóa' : 'Khóa tài khoản'}
                    >
                      {actionLoading === user._id ? <Loader2 size={16} strokeWidth={2.5} className="animate-spin" /> : (user.isLocked ? <Shield size={16} strokeWidth={2.5} /> : <ShieldOff size={16} strokeWidth={2.5} />)}
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(user._id)}
                      disabled={actionLoading === user._id}
                      title="Xóa người dùng"
                    >
                      {actionLoading === user._id ? <Loader2 size={16} strokeWidth={2.5} className="animate-spin" /> : <Trash2 size={16} strokeWidth={2.5} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export default UsersTable
