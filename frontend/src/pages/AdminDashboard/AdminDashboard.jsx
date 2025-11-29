import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, Calendar, Users as UsersIcon, FolderOpen, Download, ChevronLeft, ChevronRight, LogOut, TrendingUp, Clock, Sparkles, UserCheck, CalendarCheck, Activity, BarChart3 } from 'lucide-react'
import { motion } from 'framer-motion'
import StatCardAnimated from '../../components/StatCard/StatCardAnimated'
import DashboardCharts from '../../components/Charts/DashboardCharts'
import EventsTable from '../../components/EventsTable/EventsTable'
import UsersTable from '../../components/UsersTable/UsersTable'
import CategoriesTable from '../../components/CategoriesTable/CategoriesTable'
import ExportData from '../../components/ExportData/ExportData'
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
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeMenu, setActiveMenu] = useState('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const handleLogout = () => {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
      logout()
      navigate('/login')
    }
  }

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  // Danh sách menu - trong thực tế có thể lấy từ API
  const menuItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: <LayoutDashboard size={20} /> },
    { id: 'events', label: 'Quản lý sự kiện', icon: <Calendar size={20} /> },
    { id: 'users', label: 'Quản lý người dùng', icon: <UsersIcon size={20} /> },
    { id: 'categories', label: 'Quản lý danh mục', icon: <FolderOpen size={20} /> },
    { id: 'export', label: 'Xuất dữ liệu', icon: <Download size={20} /> },
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
      icon: <UserCheck size={32} strokeWidth={2.5} />,
      color: '#344f1f'
    },
    {
      id: 2,
      title: 'Sự kiện chờ duyệt',
      value: '12',
      icon: <Clock size={32} strokeWidth={2.5} />,
      color: '#f4991a'
    },
    {
      id: 3,
      title: 'Tổng sự kiện',
      value: '89',
      icon: <CalendarCheck size={32} strokeWidth={2.5} />,
      color: '#2ecc71'
    },
    {
      id: 4,
      title: 'Tăng trưởng',
      value: '+23%',
      icon: <Activity size={32} strokeWidth={2.5} />,
      color: '#e74c3c'
    }
  ]

  // Hàm render nội dung khác nhau tùy theo menu
  // Đây là Conditional Rendering - khái niệm quan trọng trong React
  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return (
          <>
            <motion.div 
              className="stats-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {statsData.map((stat, index) => (
                <motion.div
                  key={stat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <StatCardAnimated
                    title={stat.title}
                    value={stat.value}
                    icon={stat.icon}
                    color={stat.color}
                  />
                </motion.div>
              ))}
            </motion.div>
            <DashboardCharts />
          </>
        )
      
      case 'events':
        return <EventsTable />
      
      case 'users':
        return <UsersTable />
      
      case 'categories':
        return <CategoriesTable />
      
      case 'export':
        return <ExportData />
      
      default:
        return <div>Không tìm thấy trang</div>
    }
  }

  return (
    <div className="admin-dashboard">
      {/* SIDEBAR - Menu bên trái */}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <h2>
            {sidebarCollapsed ? 'AD' : 'Admin Dashboard'}
            <button className="toggle-btn-inline" onClick={toggleSidebar} title={sidebarCollapsed ? 'Mở rộng' : 'Thu gọn'}>
              {sidebarCollapsed ? '−' : '−'}
            </button>
          </h2>
        </div>
        
        <nav className="sidebar-menu">
          {/* Map qua mảng menuItems để tạo các nút */}
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`menu-item ${activeMenu === item.id ? 'active' : ''}`}
              onClick={() => handleMenuClick(item.id)}
              title={sidebarCollapsed ? item.label : ''}
            >
              <span className="menu-icon">{item.icon}</span>
              {!sidebarCollapsed && <span className="menu-label">{item.label}</span>}
            </button>
          ))}
        </nav>

        <button className="logout-btn" onClick={handleLogout} title={sidebarCollapsed ? 'Đăng xuất' : ''}>
          <LogOut size={18} />
          {!sidebarCollapsed && <span style={{ marginLeft: '8px' }}>Đăng xuất</span>}
        </button>
      </aside>

      {/* MAIN CONTENT - Nội dung chính */}
      <main className={`main-content ${sidebarCollapsed ? 'expanded' : ''}`}>
        {/* Gọi hàm renderContent() để hiển thị nội dung tương ứng */}
        {/* Nội dung sẽ thay đổi dựa vào activeMenu */}
        {renderContent()}
      </main>
    </div>
  )
}

export default AdminDashboard
