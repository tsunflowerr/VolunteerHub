import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Calendar, 
  Users as UsersIcon, 
  FolderOpen, 
  Download, 
  LogOut, 
  UserCheck, 
  Clock, 
  CalendarCheck, 
  Activity,
  TrendingUp,
  BarChart3
} from 'lucide-react'
import { motion } from 'framer-motion'
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts'
import './AdminDashboard.css'

function AdminDashboard() {
  const navigate = useNavigate()
  const [activeMenu, setActiveMenu] = useState('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = () => {
    if (confirm('Ban co chac muon dang xuat?')) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('currentUser')
      navigate('/admin/login')
    }
  }

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  const menuItems = [
    { id: 'dashboard', label: 'Tong quan', icon: <LayoutDashboard size={20} /> },
    { id: 'events', label: 'Quan ly su kien', icon: <Calendar size={20} /> },
    { id: 'users', label: 'Quan ly nguoi dung', icon: <UsersIcon size={20} /> },
    { id: 'categories', label: 'Quan ly danh muc', icon: <FolderOpen size={20} /> },
    { id: 'export', label: 'Xuat du lieu', icon: <Download size={20} /> },
  ]

  const handleMenuClick = (menuId) => {
    setActiveMenu(menuId)
  }

  const statsData = [
    { id: 1, title: 'Tong nguoi dung', value: '1,234', icon: <UserCheck size={32} />, color: '#344f1f' },
    { id: 2, title: 'Su kien cho duyet', value: '12', icon: <Clock size={32} />, color: '#f4991a' },
    { id: 3, title: 'Tong su kien', value: '89', icon: <CalendarCheck size={32} />, color: '#2ecc71' },
    { id: 4, title: 'Tang truong', value: '+23%', icon: <Activity size={32} />, color: '#e74c3c' }
  ]

  const chartData = [
    { month: 'Thang 1', events: 12, users: 45, registrations: 78 },
    { month: 'Thang 2', events: 19, users: 62, registrations: 95 },
    { month: 'Thang 3', events: 15, users: 58, registrations: 112 },
    { month: 'Thang 4', events: 22, users: 71, registrations: 134 },
    { month: 'Thang 5', events: 28, users: 89, registrations: 156 },
    { month: 'Thang 6', events: 25, users: 95, registrations: 178 },
  ]

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
                  className="stat-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  style={{ borderLeftColor: stat.color }}
                >
                  <div className="stat-icon" style={{ color: stat.color }}>
                    {stat.icon}
                  </div>
                  <div className="stat-info">
                    <span className="stat-value">{stat.value}</span>
                    <span className="stat-title">{stat.title}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
            
            <div className="charts-container">
              <motion.div 
                className="chart-card"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h3><TrendingUp size={20} /> Thong ke nguoi dung</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="users" stroke="#344f1f" strokeWidth={3} name="Nguoi dung" />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>

              <motion.div 
                className="chart-card"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <h3><BarChart3 size={20} /> Su kien and Dang ky</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="events" fill="#344f1f" name="Su kien" />
                    <Bar dataKey="registrations" fill="#f4991a" name="Dang ky" />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            </div>
          </>
        )
      
      case 'events':
        return <div className="content-placeholder">Quan ly Su kien - Coming soon</div>
      
      case 'users':
        return <div className="content-placeholder">Quan ly Nguoi dung - Coming soon</div>
      
      case 'categories':
        return <div className="content-placeholder">Quan ly Danh muc - Coming soon</div>
      
      case 'export':
        return <div className="content-placeholder">Xuat Du lieu - Coming soon</div>
      
      default:
        return <div>Khong tim thay trang</div>
    }
  }

  return (
    <div className="admin-dashboard">
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <h2>
            {sidebarCollapsed ? 'VH' : 'VolunteerHub Admin'}
            <button className="toggle-btn" onClick={toggleSidebar}>
              {sidebarCollapsed ? '>' : '<'}
            </button>
          </h2>
        </div>
        
        <nav className="sidebar-menu">
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

        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={18} />
          {!sidebarCollapsed && <span>Dang xuat</span>}
        </button>
      </aside>

      <main className={`main-content ${sidebarCollapsed ? 'expanded' : ''}`}>
        <div className="content-header">
          <h1>{menuItems.find(m => m.id === activeMenu)?.label || 'Dashboard'}</h1>
          {user && <span className="user-info">Xin chao, {user.fullName || user.email}</span>}
        </div>
        {renderContent()}
      </main>
    </div>
  )
}

export default AdminDashboard