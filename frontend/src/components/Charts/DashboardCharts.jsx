import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'
import styles from './DashboardCharts.module.css'

/**
 * Dashboard Charts using Recharts
 */

const mockData = [
  { month: 'Tháng 1', events: 12, users: 45, registrations: 78 },
  { month: 'Tháng 2', events: 19, users: 62, registrations: 95 },
  { month: 'Tháng 3', events: 15, users: 58, registrations: 112 },
  { month: 'Tháng 4', events: 22, users: 71, registrations: 134 },
  { month: 'Tháng 5', events: 28, users: 89, registrations: 156 },
  { month: 'Tháng 6', events: 25, users: 95, registrations: 178 },
]

import { TrendingUp, BarChart3 } from 'lucide-react'

function DashboardCharts() {
  return (
    <div className={styles.container}>
      {/* Line Chart - Người dùng theo tháng */}
      <motion.div 
        className={styles.chartCard}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h3 className={styles.chartTitle}>
          <TrendingUp size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
          Thống kê người dùng
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={mockData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="users" 
              stroke="#344f1f" 
              strokeWidth={3}
              name="Người dùng" 
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Bar Chart - Sự kiện và đăng ký */}
      <motion.div 
        className={styles.chartCard}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h3 className={styles.chartTitle}>
          <BarChart3 size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
          Sự kiện & Đăng ký
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={mockData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="events" fill="#344f1f" name="Sự kiện" />
            <Bar dataKey="registrations" fill="#f4991a" name="Đăng ký" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  )
}

export default DashboardCharts
