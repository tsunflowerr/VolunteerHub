import { useState, useEffect } from 'react'

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

  // Hàm xử lý duyệt sự kiện
  const handleApprove = async (eventId) => {
    try {
      const response = await fetch(`http://localhost:4000/api/admin/events/${eventId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Thêm JWT token
          // 'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Không thể duyệt sự kiện')
      }

      // Cập nhật lại state - thay đổi status của event
      setEvents(events.map(event => 
        event._id === eventId 
          ? { ...event, status: 'approved' }
          : event
      ))
      
      console.log('Duyệt sự kiện thành công:', eventId)
    } catch (err) {
      console.error('Lỗi:', err)
      alert('Có lỗi xảy ra khi duyệt sự kiện')
    }
  }

  const handleReject = async (eventId) => {
    try {
      const response = await fetch(`http://localhost:4000/api/admin/events/${eventId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error('Không thể từ chối sự kiện')
      }

      // Cập nhật lại state
      setEvents(events.map(event => 
        event._id === eventId 
          ? { ...event, status: 'rejected' }
          : event
      ))
      
      console.log('Từ chối sự kiện thành công:', eventId)
    } catch (err) {
      console.error('Lỗi:', err)
      alert('Có lỗi xảy ra khi từ chối sự kiện')
    }
  }

  const handleDelete = async (eventId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa sự kiện này?')) {
      return
    }

    try {
      const response = await fetch(`http://localhost:4000/api/admin/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error('Không thể xóa sự kiện')
      }

      // Xóa event khỏi state
      setEvents(events.filter(event => event._id !== eventId))
      
      console.log('Xóa sự kiện thành công:', eventId)
    } catch (err) {
      console.error('Lỗi:', err)
      alert('Có lỗi xảy ra khi xóa sự kiện')
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
        <h2>📅 Danh sách Sự kiện ({events.length})</h2>
        <button className="btn-primary">+ Tạo sự kiện mới</button>
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
            {/* Map qua mảng events để render từng dòng */}
            {events.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center">
                  Không có sự kiện nào
                </td>
              </tr>
            ) : (
              events.map((event, index) => (
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
                            title="Duyệt sự kiện"
                          >
                            ✓
                          </button>
                          <button 
                            className="btn-reject"
                            onClick={() => handleReject(event._id)}
                            title="Từ chối"
                          >
                            ✗
                          </button>
                        </>
                      )}
                      <button 
                        className="btn-delete"
                        onClick={() => handleDelete(event._id)}
                        title="Xóa sự kiện"
                      >
                        🗑️
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
