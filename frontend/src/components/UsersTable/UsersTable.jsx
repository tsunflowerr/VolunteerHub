import { useState, useEffect } from 'react'
import { Shield, ShieldOff, Trash2, Loader2, Search, Filter, UserPlus, CheckCircle2, XCircle, ChevronLeft, ChevronRight, X, Eye, EyeOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
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
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalUsers, setTotalUsers] = useState(0)
  
  // Search states
  const [isSearching, setIsSearching] = useState(false)

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'user'
  })
  const [formErrors, setFormErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch users data from API with search & filter
  const fetchUsers = async (search = '', role = 'all', page = 1) => {
    try {
      setLoading(true)
      setError(null)
      
      // Build query params
      const params = new URLSearchParams()
      if (search) params.append('q', search)
      if (role && role !== 'all') params.append('role', role)
      params.append('page', page)
      params.append('limit', itemsPerPage)
      
      // Gọi API lấy danh sách users với tìm kiếm
      const response = await fetch(`http://localhost:4000/api/users?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Lỗi: ${response.status}`)
      }

      const data = await response.json()
      
      // Map dữ liệu từ API sang format frontend
      const mappedUsers = (data.users || data.data || []).map(user => ({
        _id: user._id,
        fullName: user.username || user.fullName,
        email: user.email,
        role: user.role || 'user',
        isLocked: user.status === 'locked',
        createdAt: user.createdAt
      }))
      
      setUsers(mappedUsers)
      setTotalUsers(data.pagination?.total || mappedUsers.length)
      console.log('✅ Đã lấy dữ liệu users từ API:', mappedUsers.length, 'người dùng')
      
    } catch (err) {
      console.error('Lỗi khi lấy dữ liệu users:', err)
      setError(err.message)
    } finally {
      setLoading(false)
      setIsSearching(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchUsers()
  }, [])

  // Debounced search - gọi API sau 500ms ngừng gõ
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== '' || filterRole !== 'all') {
        setIsSearching(true)
        fetchUsers(searchTerm, filterRole, 1)
        setCurrentPage(1)
      } else {
        fetchUsers('', 'all', 1)
        setCurrentPage(1)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm, filterRole])

  // Fetch when page changes
  useEffect(() => {
    fetchUsers(searchTerm, filterRole, currentPage)
  }, [currentPage, itemsPerPage])

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  // Validate form
  const validateForm = () => {
    const errors = {}
    
    if (!formData.fullName.trim()) {
      errors.fullName = 'Vui lòng nhập họ tên'
    } else if (formData.fullName.trim().length < 2) {
      errors.fullName = 'Họ tên phải có ít nhất 2 ký tự'
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Vui lòng nhập email'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email không hợp lệ'
    } else if (users.some(u => u.email.toLowerCase() === formData.email.toLowerCase())) {
      errors.email = 'Email đã tồn tại trong hệ thống'
    }
    
    if (!formData.password) {
      errors.password = 'Vui lòng nhập mật khẩu'
    } else if (formData.password.length < 6) {
      errors.password = 'Mật khẩu phải có ít nhất 6 ký tự'
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Vui lòng xác nhận mật khẩu'
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Mật khẩu xác nhận không khớp'
    }
    
    if (formData.phone && !/^[0-9]{10,11}$/.test(formData.phone)) {
      errors.phone = 'Số điện thoại không hợp lệ (10-11 số)'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsSubmitting(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Create new user
      const newUser = {
        _id: String(Date.now()),
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone,
        role: formData.role,
        isLocked: false,
        createdAt: new Date().toISOString()
      }
      
      setUsers(prev => [newUser, ...prev])
      
      // Reset form and close modal
      setFormData({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        role: 'user'
      })
      setShowModal(false)
      alert('✅ Tạo người dùng mới thành công!')
    } catch (err) {
      alert('❌ Có lỗi xảy ra khi tạo người dùng')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Close modal and reset form
  const handleCloseModal = () => {
    setShowModal(false)
    setFormData({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      role: 'user'
    })
    setFormErrors({})
  }

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

  // Pagination logic - sử dụng totalUsers từ API
  const totalPages = Math.ceil(totalUsers / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, totalUsers)

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const renderPagination = () => {
    if (totalPages <= 1) return null
    
    const pages = []
    const maxVisiblePages = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    return (
      <div className="pagination">
        <div className="pagination-info">
          Hiển thị {startIndex + 1}-{endIndex} / {totalUsers} kết quả
          {isSearching && <Loader2 size={14} className="animate-spin" style={{ marginLeft: 8 }} />}
        </div>
        <div className="pagination-controls">
          <button 
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={18} />
          </button>
          
          {startPage > 1 && (
            <>
              <button className="pagination-btn" onClick={() => handlePageChange(1)}>1</button>
              {startPage > 2 && <span className="pagination-ellipsis">...</span>}
            </>
          )}
          
          {pages.map(page => (
            <button
              key={page}
              className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          ))}
          
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="pagination-ellipsis">...</span>}
              <button className="pagination-btn" onClick={() => handlePageChange(totalPages)}>{totalPages}</button>
            </>
          )}
          
          <button 
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight size={18} />
          </button>
        </div>
        <div className="pagination-size">
          <select 
            value={itemsPerPage} 
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value))
              setCurrentPage(1)
            }}
          >
            <option value={5}>5 / trang</option>
            <option value={10}>10 / trang</option>
            <option value={20}>20 / trang</option>
            <option value={50}>50 / trang</option>
          </select>
        </div>
      </div>
    )
  }

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
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <UserPlus size={18} strokeWidth={2.5} />
          Tạo người dùng mới
        </button>
      </div>

      {/* Modal Create User */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseModal}
          >
            <motion.div 
              className="modal-content"
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>Tạo người dùng mới</h3>
                <button className="modal-close" onClick={handleCloseModal}>
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-group">
                  <label htmlFor="fullName">Họ và tên <span className="required">*</span></label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Nhập họ và tên"
                    className={formErrors.fullName ? 'error' : ''}
                  />
                  {formErrors.fullName && <span className="error-text">{formErrors.fullName}</span>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email <span className="required">*</span></label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Nhập địa chỉ email"
                    className={formErrors.email ? 'error' : ''}
                  />
                  {formErrors.email && <span className="error-text">{formErrors.email}</span>}
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="password">Mật khẩu <span className="required">*</span></label>
                    <div className="password-input">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Nhập mật khẩu"
                        className={formErrors.password ? 'error' : ''}
                      />
                      <button 
                        type="button" 
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {formErrors.password && <span className="error-text">{formErrors.password}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="confirmPassword">Xác nhận mật khẩu <span className="required">*</span></label>
                    <div className="password-input">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Nhập lại mật khẩu"
                        className={formErrors.confirmPassword ? 'error' : ''}
                      />
                      <button 
                        type="button" 
                        className="password-toggle"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {formErrors.confirmPassword && <span className="error-text">{formErrors.confirmPassword}</span>}
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone">Số điện thoại</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Nhập số điện thoại"
                      className={formErrors.phone ? 'error' : ''}
                    />
                    {formErrors.phone && <span className="error-text">{formErrors.phone}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="role">Vai trò <span className="required">*</span></label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                    >
                      <option value="user">Người dùng</option>
                      <option value="manager">Quản lý</option>
                      <option value="admin">Quản trị viên</option>
                    </select>
                  </div>
                </div>
                
                <div className="modal-actions">
                  <button type="submit" className="btn-submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Đang tạo...
                      </>
                    ) : (
                      <>
                        <UserPlus size={18} />
                        Tạo người dùng
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search and Filter */}
      <div className="table-controls">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {isSearching && <Loader2 size={16} className="animate-spin" />}
          {searchTerm && !isSearching && (
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
          {users.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center' }}>
                {searchTerm || filterRole !== 'all' ? 'Không tìm thấy người dùng phù hợp' : 'Chưa có người dùng'}
              </td>
            </tr>
          ) : (
            users.map((user, index) => (
              <tr key={user._id}>
                <td>{startIndex + index + 1}</td>
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
      
      {renderPagination()}
    </div>
  )
}

export default UsersTable
