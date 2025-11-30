import { useState, useEffect, useMemo } from 'react'
import { CheckCircle2, XCircle, Trash2, Loader2, Search, Filter, Plus, Calendar, MapPin, Users, ChevronLeft, ChevronRight } from 'lucide-react'
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
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // useEffect - chạy 1 lần khi component mount
  // [] (empty dependency array) = chỉ chạy 1 lần khi component xuất hiện
  useEffect(() => {
    // Hàm lấy dữ liệu từ API
    const fetchEvents = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Gọi API lấy danh sách sự kiện
        const response = await fetch('http://localhost:4000/api/events', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error(`Lỗi: ${response.status}`)
        }

        const data = await response.json()
        
        // Map dữ liệu từ API sang format phù hợp với frontend
        const mappedEvents = (data.events || []).map(event => ({
          _id: event._id,
          title: event.name,
          createdBy: event.managerId ? { fullName: event.managerId.username } : null,
          eventDate: event.startDate,
          maxParticipants: event.capacity,
          status: event.status,
          category: event.category?.[0]?.name || 'Chưa phân loại'
        }))
        
        setEvents(mappedEvents)
        console.log('✅ Đã lấy dữ liệu từ API:', mappedEvents.length, 'sự kiện')
        
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

  // Pagination logic
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedEvents = filteredEvents.slice(startIndex, endIndex)

  // Reset to page 1 when filter/search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterStatus])

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
          Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredEvents.length)} / {filteredEvents.length} kết quả
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
            {/* BƯỚC 8: Hiển thị paginatedEvents thay vì filteredEvents */}
            {paginatedEvents.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center">
                  {events.length === 0 ? 'Chưa có sự kiện nào' : 'Không tìm thấy sự kiện phù hợp'}
                </td>
              </tr>
            ) : (
              paginatedEvents.map((event, index) => (
                <tr key={event._id}>
                  <td>{startIndex + index + 1}</td>
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
      
      {renderPagination()}
    </div>
  )
}

export default EventsTable
