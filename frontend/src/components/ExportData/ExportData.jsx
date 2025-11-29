import { useState } from 'react'
import './ExportData.css'

/**
 * BƯỚC 15: Export Data
 * Chức năng xuất dữ liệu ra file CSV
 */

function ExportData() {
  const [exporting, setExporting] = useState({
    users: false,
    events: false
  })

  // Mock data để demo export
  const mockUsers = [
    { id: 1, name: 'Nguyễn Văn A', email: 'a@example.com', role: 'user', status: 'active' },
    { id: 2, name: 'Trần Thị B', email: 'b@example.com', role: 'manager', status: 'active' },
    { id: 3, name: 'Lê Văn C', email: 'c@example.com', role: 'user', status: 'locked' }
  ]

  const mockEvents = [
    { id: 1, name: 'Dọn rác bãi biển', location: 'Vũng Tàu', date: '2024-12-15', status: 'approved' },
    { id: 2, name: 'Dạy học cho trẻ em', location: 'Quận 1', date: '2024-12-20', status: 'pending' },
    { id: 3, name: 'Khám bệnh miễn phí', location: 'Quận 3', date: '2024-12-25', status: 'approved' }
  ]

  // Chuyển data thành CSV format
  const convertToCSV = (data, type) => {
    if (data.length === 0) return ''

    let headers = []
    let rows = []

    if (type === 'users') {
      headers = ['ID', 'Tên', 'Email', 'Vai trò', 'Trạng thái']
      rows = data.map(user => [
        user.id,
        user.name,
        user.email,
        user.role,
        user.status
      ])
    } else if (type === 'events') {
      headers = ['ID', 'Tên sự kiện', 'Địa điểm', 'Ngày', 'Trạng thái']
      rows = data.map(event => [
        event.id,
        event.name,
        event.location,
        event.date,
        event.status
      ])
    }

    // Tạo CSV string
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    return csvContent
  }

  // Download CSV file
  const downloadCSV = (csvContent, filename) => {
    // Thêm BOM để Excel hiển thị đúng tiếng Việt
    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Handle export users
  const handleExportUsers = () => {
    setExporting({ ...exporting, users: true })

    // Giả lập thời gian xử lý
    setTimeout(() => {
      const csv = convertToCSV(mockUsers, 'users')
      const filename = `users_${new Date().toISOString().split('T')[0]}.csv`
      downloadCSV(csv, filename)
      
      setExporting({ ...exporting, users: false })
      alert('✅ Đã xuất file danh sách Users!')
    }, 1000)
  }

  // Handle export events
  const handleExportEvents = () => {
    setExporting({ ...exporting, events: true })

    setTimeout(() => {
      const csv = convertToCSV(mockEvents, 'events')
      const filename = `events_${new Date().toISOString().split('T')[0]}.csv`
      downloadCSV(csv, filename)
      
      setExporting({ ...exporting, events: false })
      alert('✅ Đã xuất file danh sách Events!')
    }, 1000)
  }

  return (
    <div className="export-container">
      <div className="export-header">
        <h2>📊 Xuất Dữ Liệu (Export Data)</h2>
        <p>Tải xuống dữ liệu dưới dạng file CSV</p>
      </div>

      <div className="export-cards">
        {/* Export Users Card */}
        <div className="export-card">
          <div className="card-icon">👥</div>
          <h3>Danh sách Users</h3>
          <p>Xuất toàn bộ thông tin người dùng</p>
          <ul className="info-list">
            <li>✓ Tên, Email, Vai trò</li>
            <li>✓ Trạng thái tài khoản</li>
            <li>✓ Ngày tạo tài khoản</li>
          </ul>
          <button 
            className="btn-export"
            onClick={handleExportUsers}
            disabled={exporting.users}
          >
            {exporting.users ? '⏳ Đang xuất...' : '📥 Xuất Users CSV'}
          </button>
        </div>

        {/* Export Events Card */}
        <div className="export-card">
          <div className="card-icon">🎯</div>
          <h3>Danh sách Events</h3>
          <p>Xuất toàn bộ thông tin sự kiện</p>
          <ul className="info-list">
            <li>✓ Tên, Địa điểm, Thời gian</li>
            <li>✓ Trạng thái duyệt</li>
            <li>✓ Số lượng tham gia</li>
          </ul>
          <button 
            className="btn-export"
            onClick={handleExportEvents}
            disabled={exporting.events}
          >
            {exporting.events ? '⏳ Đang xuất...' : '📥 Xuất Events CSV'}
          </button>
        </div>
      </div>

      {/* Preview Data */}
      <div className="preview-section">
        <h3>👀 Xem trước dữ liệu</h3>
        
        <div className="preview-tables">
          <div className="preview-table">
            <h4>Users ({mockUsers.length} records)</h4>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên</th>
                  <th>Email</th>
                  <th>Vai trò</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {mockUsers.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`badge ${user.role}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${user.status}`}>
                        {user.status === 'active' ? '✅ Active' : '🔒 Locked'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="preview-table">
            <h4>Events ({mockEvents.length} records)</h4>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên sự kiện</th>
                  <th>Địa điểm</th>
                  <th>Ngày</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {mockEvents.map(event => (
                  <tr key={event.id}>
                    <td>{event.id}</td>
                    <td>{event.name}</td>
                    <td>{event.location}</td>
                    <td>{event.date}</td>
                    <td>
                      <span className={`badge ${event.status}`}>
                        {event.status === 'approved' ? '✅ Approved' : '⏳ Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExportData
