import { useState, useEffect } from 'react'
import { CheckCircle2, XCircle, Trash2, Loader2, Search, Filter, Plus, Calendar, MapPin, Users } from 'lucide-react'
import './EventsTable.css'
import './EventsTable_SearchFilter.css'

/**
 * BƯỚC 5: Tích hợp Backend API
 * 
 * Khái niệm mới:
 * 1. useEffect - Chạy code khi component mount
 * 2. fetch API - Gọi API để lấy dữ liệu
 * 3. async/await - Xử lý bất đồng bộ
 * 4. Loading & Error states - Quản lý trạng thái
 */

function EventsTable() {
  // State để lưu danh sách events từ API
  const [events, setEvents] = useState([])
  // State để quản lý trạng thái loading
  const [loading, setLoading] = useState(true)
  // State để quản lý lỗi
  const [error, setError] = useState(null)
  
  // BƯỚC 7: Loading state cho từng hành động
  const [actionLoading, setActionLoading] = useState(null) // Lưu ID của event đang xử lý
  
  // BƯỚC 8: Search và Filter states
  const [searchTerm, setSearchTerm] = useState('') // Từ khóa tìm kiếm
  const [filterStatus, setFilterStatus] = useState('all') // Lọc theo trạng thái

  // useEffect - chạy 1 lần khi component mount
  // [] (empty dependency array) = chỉ chạy 1 lần khi component xuất hiện
  useEffect(() => {
    // Hàm lấy dữ liệu từ API
    const fetchEvents = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // TẠM THỜI: Dùng dữ liệu mock vì API cần authentication
        // TODO BƯỚC 6: Sẽ học về authentication và login
        console.log('⚠️  Đang dùng dữ liệu mock - Chưa kết nối API thật')
        
        // Giả lập API call delay
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Dữ liệu mock
        const mockData = [
          {
            _id: '1',
            title: 'Dọn dẹp bãi biển Vũng Tàu',
            createdBy: { fullName: 'Nguyễn Văn A' },
            eventDate: '2025-12-01',
            maxParticipants: 50,
            status: 'pending'
          },
          {
            _id: '2',
            title: 'Trồng cây xanh công viên Lê Văn Tám',
            createdBy: { fullName: 'Trần Thị B' },
            eventDate: '2025-12-05',
            maxParticipants: 30,
            status: 'approved'
          },
          {
            _id: '3',
            title: 'Trao quà từ thiện cho trẻ em vùng cao',
            createdBy: { fullName: 'Lê Văn C' },
            eventDate: '2025-12-10',
            maxParticipants: 20,
            status: 'pending'
          },
          {
            _id: '4',
            title: 'Hiến máu nhân đạo',
            createdBy: { fullName: 'Phạm Thị D' },
            eventDate: '2025-12-15',
            maxParticipants: 100,
            status: 'approved'
          }
        ]
        
        setEvents(mockData)
        
        /* KHI HỌC XONG AUTHENTICATION, SỬ DỤNG CODE NÀY:
        
        const response = await fetch('http://localhost:4000/api/admin/events', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Token từ login
          }
        })

        if (!response.ok) {
          throw new Error(`Lỗi: ${response.status}`)
        }

        const data = await response.json()
        setEvents(data.data || [])
        */
        
      } catch (err) {
        console.error('Lỗi khi lấy dữ liệu:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, []) // Empty array = chỉ chạy 1 lần

  // BƯỚC 7: Hàm xử lý duyệt sự kiện với loading state
  const handleApprove = async (eventId) => {
    try {
      setActionLoading(eventId) // Bắt đầu loading cho event này
      console.log('🟢 Đang duyệt sự kiện:', eventId)
      
      // Giả lập API delay
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Cập nhật state
      setEvents(events.map(event => 
        event._id === eventId 
          ? { ...event, status: 'approved' }
          : event
      ))
      
      console.log('✅ Duyệt sự kiện thành công!')
      alert('✅ Đã duyệt sự kiện thành công!')
      
    } catch (err) {
      console.error('❌ Lỗi:', err)
      alert('❌ Có lỗi xảy ra khi duyệt sự kiện')
    } finally {
      setActionLoading(null) // Kết thúc loading
    }
  }

  const handleReject = async (eventId) => {
    try {
      setActionLoading(eventId)
      console.log('🔴 Đang từ chối sự kiện:', eventId)
      
      await new Promise(resolve => setTimeout(resolve, 800))
      
      setEvents(events.map(event => 
        event._id === eventId 
          ? { ...event, status: 'rejected' }
          : event
      ))
      
      console.log('✅ Từ chối sự kiện thành công!')
      alert('✅ Đã từ chối sự kiện!')
    } catch (err) {
      console.error('❌ Lỗi:', err)
      alert('❌ Có lỗi xảy ra khi từ chối sự kiện')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (eventId) => {
    if (!confirm('⚠️ Bạn có chắc chắn muốn xóa sự kiện này?')) {
      return
    }

    try {
      setActionLoading(eventId)
      console.log('🗑️  Đang xóa sự kiện:', eventId)
      
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Xóa event bằng filter()
      setEvents(events.filter(event => event._id !== eventId))
      
      console.log('✅ Xóa sự kiện thành công!')
      alert('✅ Đã xóa sự kiện thành công!')
    } catch (err) {
      console.error('❌ Lỗi:', err)
      alert('❌ Có lỗi xảy ra khi xóa sự kiện')
    } finally {
      setActionLoading(null)
    }
  }

  // Hàm render status badge
  const renderStatus = (status) => {
    const statusMap = {
      pending: { label: 'Chờ duyệt', className: 'status-pending' },
      approved: { label: 'Đã duyệt', className: 'status-approved' },
      rejected: { label: 'Từ chối', className: 'status-rejected' },
      completed: { label: 'Hoàn thành', className: 'status-approved' },
      cancelled: { label: 'Đã hủy', className: 'status-rejected' }
    }
    const statusInfo = statusMap[status] || { label: status, className: 'status-pending' }
    return <span className={`status-badge ${statusInfo.className}`}>{statusInfo.label}</span>
  }

  // BƯỚC 8: Hàm lọc và tìm kiếm events
  const filteredEvents = events.filter(event => {
    // Lọc theo search term (tìm trong title và người tạo)
    const matchSearch = 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.createdBy?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Lọc theo status
    const matchStatus = filterStatus === 'all' || event.status === filterStatus
    
    // Phải thỏa CẢ HAI điều kiện
    return matchSearch && matchStatus
  })

  // Hiển thị loading
  if (loading) {
    return (
      <div className="events-table-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  // Hiển thị lỗi
  if (error) {
    return (
      <div className="events-table-container">
        <div className="error">
          <p>❌ Lỗi: {error}</p>
          <button onClick={() => window.location.reload()}>Thử lại</button>
        </div>
      </div>
    )
  }

  return (
    <div className="events-table-container">
      <div className="table-header">
        <h2>Danh sách Sự kiện</h2>
        <button className="btn-primary">+ Tạo sự kiện mới</button>
      </div>

      {/* BƯỚC 8: Search và Filter UI */}
      <div className="table-controls">
        <div className="search-box">
          <span className="search-icon"></span>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên sự kiện hoặc người tạo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button 
              className="clear-search"
              onClick={() => setSearchTerm('')}
              title="Xóa tìm kiếm"
            >
              ✕
            </button>
          )}
        </div>

        <div className="filter-box">
          <label>Trạng thái:</label>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tất cả</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="rejected">Từ chối</option>
          </select>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="events-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên sự kiện</th>
              <th>Người tổ chức</th>
              <th>Ngày</th>
              <th>Số người tham gia</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {/* BƯỚC 8: Hiển thị filteredEvents thay vì events */}
            {filteredEvents.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center">
                  {events.length === 0 ? 'Chưa có sự kiện nào' : 'Không tìm thấy sự kiện phù hợp'}
                </td>
              </tr>
            ) : (
              filteredEvents.map((event, index) => (
                <tr key={event._id}>
                  <td>{index + 1}</td>
                  <td className="event-title">{event.title}</td>
                  <td>{event.createdBy?.fullName || 'Không rõ'}</td>
                  <td>{new Date(event.eventDate).toLocaleDateString('vi-VN')}</td>
                  <td className="text-center">{event.maxParticipants || 0}</td>
                  <td>{renderStatus(event.status)}</td>
                  <td>
                    <div className="action-buttons">
                      {event.status === 'pending' && (
                        <>
                          <button 
                            className="btn-approve"
                            onClick={() => handleApprove(event._id)}
                            disabled={actionLoading === event._id}
                            title="Duyệt sự kiện"
                          >
                            {actionLoading === event._id ? <Loader2 size={16} strokeWidth={2.5} className="animate-spin" /> : <CheckCircle2 size={16} strokeWidth={2.5} />}
                          </button>
                          <button 
                            className="btn-reject"
                            onClick={() => handleReject(event._id)}
                            disabled={actionLoading === event._id}
                            title="Từ chối"
                          >
                            {actionLoading === event._id ? <Loader2 size={16} strokeWidth={2.5} className="animate-spin" /> : <XCircle size={16} strokeWidth={2.5} />}
                          </button>
                        </>
                      )}
                      <button 
                        className="btn-delete"
                        onClick={() => handleDelete(event._id)}
                        disabled={actionLoading === event._id}
                        title="Xóa sự kiện"
                      >
                        {actionLoading === event._id ? <Loader2 size={16} strokeWidth={2.5} className="animate-spin" /> : <Trash2 size={16} strokeWidth={2.5} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default EventsTable
