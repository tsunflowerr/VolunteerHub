import { useState } from 'react'
import { Users, Calendar, Download, Loader2, FileJson, FileSpreadsheet } from 'lucide-react'
import { motion } from 'framer-motion'
import './ExportData.css'

/**
 * BƯỚC 15: Export Data
 * Chức năng xuất dữ liệu ra file CSV và JSON
 */

function ExportData() {
  const [exporting, setExporting] = useState({
    usersCSV: false,
    usersJSON: false,
    eventsCSV: false,
    eventsJSON: false
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

  // Download JSON file
  const downloadJSON = (data, filename) => {
    const jsonContent = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Handle export users CSV
  const handleExportUsersCSV = () => {
    setExporting({ ...exporting, usersCSV: true })

    setTimeout(() => {
      const csv = convertToCSV(mockUsers, 'users')
      const filename = `users_${new Date().toISOString().split('T')[0]}.csv`
      downloadCSV(csv, filename)
      
      setExporting({ ...exporting, usersCSV: false })
      alert('Đã xuất file Users CSV!')
    }, 1000)
  }

  // Handle export users JSON
  const handleExportUsersJSON = () => {
    setExporting({ ...exporting, usersJSON: true })

    setTimeout(() => {
      const filename = `users_${new Date().toISOString().split('T')[0]}.json`
      downloadJSON(mockUsers, filename)
      
      setExporting({ ...exporting, usersJSON: false })
      alert('Đã xuất file Users JSON!')
    }, 1000)
  }

  // Handle export events CSV
  const handleExportEventsCSV = () => {
    setExporting({ ...exporting, eventsCSV: true })

    setTimeout(() => {
      const csv = convertToCSV(mockEvents, 'events')
      const filename = `events_${new Date().toISOString().split('T')[0]}.csv`
      downloadCSV(csv, filename)
      
      setExporting({ ...exporting, eventsCSV: false })
      alert('Đã xuất file Events CSV!')
    }, 1000)
  }

  // Handle export events JSON
  const handleExportEventsJSON = () => {
    setExporting({ ...exporting, eventsJSON: true })

    setTimeout(() => {
      const filename = `events_${new Date().toISOString().split('T')[0]}.json`
      downloadJSON(mockEvents, filename)
      
      setExporting({ ...exporting, eventsJSON: false })
      alert('Đã xuất file Events JSON!')
    }, 1000)
  }

  return (
    <div className="export-container">
      <div className="export-header">
        <h2>Xuất Dữ Liệu</h2>
        <p>Tải xuống dữ liệu dưới dạng file CSV hoặc JSON</p>
      </div>

      <div className="export-cards">
        {/* Export Users Card */}
        <motion.div 
          className="export-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          whileHover={{ y: -5, boxShadow: '0 8px 25px rgba(52, 79, 31, 0.15)' }}
        >
          <div className="card-icon">
            <Users size={48} strokeWidth={2} style={{ color: '#344f1f' }} />
          </div>
          <h3>Danh sách Users</h3>
          <p>Xuất toàn bộ thông tin người dùng</p>
          <ul className="info-list">
            <li>Tên, Email, Vai trò</li>
            <li>Trạng thái tài khoản</li>
            <li>Ngày tạo tài khoản</li>
          </ul>
          <div className="btn-group">
            <motion.button 
              className="btn-export btn-csv"
              onClick={handleExportUsersCSV}
              disabled={exporting.usersCSV}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {exporting.usersCSV ? (
                <><Loader2 size={16} strokeWidth={2.5} className="animate-spin" />Đang xuất...</>
              ) : (
                <><FileSpreadsheet size={16} strokeWidth={2.5} />CSV</>
              )}
            </motion.button>
            <motion.button 
              className="btn-export btn-json"
              onClick={handleExportUsersJSON}
              disabled={exporting.usersJSON}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {exporting.usersJSON ? (
                <><Loader2 size={16} strokeWidth={2.5} className="animate-spin" />Đang xuất...</>
              ) : (
                <><FileJson size={16} strokeWidth={2.5} />JSON</>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Export Events Card */}
        <motion.div 
          className="export-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          whileHover={{ y: -5, boxShadow: '0 8px 25px rgba(244, 153, 26, 0.15)' }}
        >
          <div className="card-icon">
            <Calendar size={48} strokeWidth={2} style={{ color: '#f4991a' }} />
          </div>
          <h3>Danh sách Events</h3>
          <p>Xuất toàn bộ thông tin sự kiện</p>
          <ul className="info-list">
            <li>Tên, Địa điểm, Thời gian</li>
            <li>Trạng thái duyệt</li>
            <li>Số lượng tham gia</li>
          </ul>
          <div className="btn-group">
            <motion.button 
              className="btn-export btn-csv"
              onClick={handleExportEventsCSV}
              disabled={exporting.eventsCSV}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {exporting.eventsCSV ? (
                <><Loader2 size={16} strokeWidth={2.5} className="animate-spin" />Đang xuất...</>
              ) : (
                <><FileSpreadsheet size={16} strokeWidth={2.5} />CSV</>
              )}
            </motion.button>
            <motion.button 
              className="btn-export btn-json"
              onClick={handleExportEventsJSON}
              disabled={exporting.eventsJSON}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {exporting.eventsJSON ? (
                <><Loader2 size={16} strokeWidth={2.5} className="animate-spin" />Đang xuất...</>
              ) : (
                <><FileJson size={16} strokeWidth={2.5} />JSON</>
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default ExportData
