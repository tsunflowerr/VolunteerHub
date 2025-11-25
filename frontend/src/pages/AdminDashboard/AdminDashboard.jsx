import { useState } from 'react'
import StatCard from '../../components/StatCard/StatCard'
import EventsTable from '../../components/EventsTable/EventsTable'
import '../../components/StatCard/StatCard.css'
import '../../components/EventsTable/EventsTable.css'
import './AdminDashboard.css'

/**
 * BƯỚC 4: Conditional Rendering - Hiển thị nội dung khác nhau tùy menu
 * 
 * Khái niệm mới:
 * 1. Conditional Rendering - Render component khác nhau dựa vào điều kiện
 * 2. Component Composition - Kết hợp nhiều component lại
 * 3. Switch case pattern - Xử lý nhiều điều kiện
 */

function AdminDashboard() {
  // useState trả về [giá trị, hàm để thay đổi giá trị]
  // 'dashboard' là giá trị khởi tạo
  const [activeMenu, setActiveMenu] = useState('dashboard')

  // Danh sách menu - trong thực tế có thể lấy từ API
  const menuItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: '📊' },
    { id: 'events', label: 'Quản lý sự kiện', icon: '📅' },
    { id: 'users', label: 'Quản lý người dùng', icon: '👥' },
    { id: 'categories', label: 'Quản lý danh mục', icon: '📁' },
    { id: 'export', label: 'Xuất dữ liệu', icon: '📥' },
  ]

  // Hàm xử lý khi click menu
  const handleMenuClick = (menuId) => {
    setActiveMenu(menuId) // Cập nhật state
    console.log('Menu được chọn:', menuId)
  }

  // Dữ liệu cho statistics cards
  // Trong thực tế, dữ liệu này sẽ lấy từ API backend
  const statsData = [
    {
      id: 1,
      title: 'Tổng người dùng',
      value: '1,234',
      icon: '👥',
      color: '#3498db'
    },
    {
      id: 2,
      title: 'Sự kiện chờ duyệt',
      value: '12',
      icon: '⏳',
      color: '#f39c12'
    },
    {
      id: 3,
      title: 'Tổng sự kiện',
      value: '89',
      icon: '📅',
      color: '#2ecc71'
    },
    {
      id: 4,
      title: 'Đăng ký mới',
      value: '45',
      icon: '✨',
      color: '#e74c3c'
    },
    {
        id: 5,
        title: 'Bình luận mới',
        value: '28',
        icon: '💬',
        color: '#9b59b6'
    }
  ]

  // Hàm render nội dung khác nhau tùy theo menu
  // Đây là Conditional Rendering - khái niệm quan trọng trong React
  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return (
          <div className="stats-container">
            {statsData.map((stat) => (
              <StatCard
                key={stat.id}
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                color={stat.color}
              />
            ))}
          </div>
        )
      
      case 'events':
        return <EventsTable />
      
      case 'users':
        return (
          <div className="placeholder">
            <h2>👥 Quản lý Người dùng</h2>
            <p>Trang này sẽ được phát triển ở bước sau</p>
          </div>
        )
      
      case 'categories':
        return (
          <div className="placeholder">
            <h2>📁 Quản lý Danh mục</h2>
            <p>Trang này sẽ được phát triển ở bước sau</p>
          </div>
        )
      
      case 'export':
        return (
          <div className="placeholder">
            <h2>📥 Xuất Dữ liệu</h2>
            <p>Trang này sẽ được phát triển ở bước sau</p>
          </div>
        )
      
      default:
        return <div>Không tìm thấy trang</div>
    }
  }

  return (
    <div className="admin-dashboard">
      {/* SIDEBAR - Menu bên trái */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>🎯 Admin Panel</h2>
        </div>
        
        <nav className="sidebar-menu">
          {/* Map qua mảng menuItems để tạo các nút */}
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`menu-item ${activeMenu === item.id ? 'active' : ''}`}
              onClick={() => handleMenuClick(item.id)}
            >
              <span className="menu-icon">{item.icon}</span>
              <span className="menu-label">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT - Nội dung chính */}
      <main className="main-content">
        <header className="content-header">
          <h1>Chào mừng đến Admin Dashboard</h1>
          <p>Menu đang chọn: <strong>{activeMenu}</strong></p>
        </header>
        
        {/* Gọi hàm renderContent() để hiển thị nội dung tương ứng */}
        {/* Nội dung sẽ thay đổi dựa vào activeMenu */}
        {renderContent()}
      </main>
    </div>
  )
}

export default AdminDashboard
