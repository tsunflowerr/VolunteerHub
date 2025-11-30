import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Sparkles, 
  TrendingUp, 
  Clock, 
  Users, 
  MessageSquare, 
  Heart, 
  FileText, 
  Eye,
  ChevronRight,
  Flame,
  Bell,
  Calendar
} from 'lucide-react'
import styles from './DashboardWidgets.module.css'

/**
 * Dashboard Widgets - Hiển thị các thông tin tổng hợp
 * Gọi API thật:
 * - GET /api/events/trending - Sự kiện trending
 * - GET /api/events/upcoming - Sự kiện sắp diễn ra
 * - GET /api/events - Sự kiện mới
 */

// Hàm format thời gian tương đối
const formatRelativeTime = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) return `${diffMins} phút trước`
  if (diffHours < 24) return `${diffHours} giờ trước`
  if (diffDays < 7) return `${diffDays} ngày trước`
  return date.toLocaleDateString('vi-VN')
}

// Component Widget: Sự kiện mới công bố
function NewEventsWidget() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNewEvents = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/events?limit=4')
        const data = await response.json()
        
        const mappedEvents = (data.events || []).map(event => ({
          _id: event._id,
          name: event.name,
          thumbnail: event.thumbnail || 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=100&h=100&fit=crop',
          status: event.status,
          publishedAt: event.createdAt,
          managerId: event.managerId || { username: 'Không rõ' },
          category: event.category || [{ name: 'Chưa phân loại' }]
        }))
        
        setEvents(mappedEvents)
        console.log('✅ Đã lấy sự kiện mới:', mappedEvents.length)
      } catch (err) {
        console.error('Lỗi lấy sự kiện mới:', err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchNewEvents()
  }, [])

  if (loading) {
    return (
      <div className={styles.widget}>
        <div className={styles.widgetHeader}>
          <div className={styles.widgetTitle}>
            <Bell size={20} strokeWidth={2.5} />
            <span>Sự kiện mới công bố</span>
          </div>
        </div>
        <div className={styles.loading}>Đang tải...</div>
      </div>
    )
  }

  return (
    <motion.div 
      className={styles.widget}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className={styles.widgetHeader}>
        <div className={styles.widgetTitle}>
          <Bell size={20} strokeWidth={2.5} />
          <span>Sự kiện mới công bố</span>
        </div>
        <button className={styles.viewAllBtn}>
          Xem tất cả <ChevronRight size={16} />
        </button>
      </div>
      
      <div className={styles.widgetContent}>
        {events.length === 0 ? (
          <p className={styles.noData}>Chưa có sự kiện nào</p>
        ) : (
          events.map((event, index) => (
            <motion.div 
              key={event._id}
              className={styles.eventItem}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, backgroundColor: '#f8f9fa' }}
            >
              <img 
                src={event.thumbnail} 
                alt={event.name}
                className={styles.eventThumb}
              />
              <div className={styles.eventInfo}>
                <h4 className={styles.eventName}>{event.name}</h4>
                <div className={styles.eventMeta}>
                  <span className={styles.category}>{event.category[0]?.name}</span>
                  <span className={styles.separator}>•</span>
                  <span className={styles.organizer}>{event.managerId?.username}</span>
                </div>
                <div className={styles.publishedTime}>
                  <Clock size={12} />
                  <span>{formatRelativeTime(event.publishedAt)}</span>
                </div>
              </div>
              <span className={styles.newBadge}>Mới</span>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  )
}

// Component Widget: Sự kiện sắp diễn ra
function EventsWithNewPostsWidget() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/events/upcoming?limit=3')
        const data = await response.json()
        
        const mappedEvents = (data.events || data.data || []).map(event => ({
          _id: event._id,
          name: event.name,
          thumbnail: event.thumbnail || 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=100&h=100&fit=crop',
          startDate: event.startDate,
          location: event.location,
          capacity: event.capacity
        }))
        
        setEvents(mappedEvents)
        console.log('✅ Đã lấy sự kiện sắp diễn ra:', mappedEvents.length)
      } catch (err) {
        console.error('Lỗi lấy sự kiện sắp diễn ra:', err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchUpcomingEvents()
  }, [])

  if (loading) {
    return (
      <div className={styles.widget}>
        <div className={styles.widgetHeader}>
          <div className={styles.widgetTitle}>
            <Calendar size={20} strokeWidth={2.5} />
            <span>Sắp diễn ra</span>
          </div>
        </div>
        <div className={styles.loading}>Đang tải...</div>
      </div>
    )
  }

  return (
    <motion.div 
      className={styles.widget}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className={styles.widgetHeader}>
        <div className={styles.widgetTitle}>
          <Calendar size={20} strokeWidth={2.5} />
          <span>Sắp diễn ra</span>
        </div>
        <button className={styles.viewAllBtn}>
          Xem tất cả <ChevronRight size={16} />
        </button>
      </div>
      
      <div className={styles.widgetContent}>
        {events.length === 0 ? (
          <p className={styles.noData}>Chưa có sự kiện sắp diễn ra</p>
        ) : (
          events.map((event, index) => (
            <motion.div 
              key={event._id}
              className={styles.eventItem}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, backgroundColor: '#f8f9fa' }}
            >
              <img 
                src={event.thumbnail} 
                alt={event.name}
                className={styles.eventThumb}
              />
              <div className={styles.eventInfo}>
                <h4 className={styles.eventName}>{event.name}</h4>
                <div className={styles.postPreview}>
                  <Clock size={12} />
                  <span className={styles.postTitle}>
                    {new Date(event.startDate).toLocaleDateString('vi-VN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className={styles.eventMeta}>
                  <span className={styles.author}>
                    <Users size={12} /> {event.capacity || 0} người
                  </span>
                </div>
              </div>
              <span className={styles.postCountBadge}>
                Sắp tới
              </span>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  )
}

// Component Widget: Sự kiện thu hút (Trending)
function TrendingEventsWidget() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTrendingEvents = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/events/trending?limit=4')
        const data = await response.json()
        
        const mappedEvents = (data.events || data.data || []).map(event => ({
          _id: event._id,
          name: event.name,
          thumbnail: event.thumbnail || 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=100&h=100&fit=crop',
          likesCount: event.likesCount || 0,
          registrationsCount: event.registrationsCount || 0,
          commentsCount: event.commentsCount || 0,
          viewCount: event.viewCount || 0
        }))
        
        setEvents(mappedEvents)
        console.log('✅ Đã lấy sự kiện trending:', mappedEvents.length)
      } catch (err) {
        console.error('Lỗi lấy sự kiện trending:', err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchTrendingEvents()
  }, [])

  if (loading) {
    return (
      <div className={`${styles.widget} ${styles.widgetFull}`}>
        <div className={styles.widgetHeader}>
          <div className={styles.widgetTitle}>
            <Flame size={20} strokeWidth={2.5} className={styles.flameIcon} />
            <span>Sự kiện thu hút</span>
          </div>
        </div>
        <div className={styles.loading}>Đang tải...</div>
      </div>
    )
  }

  return (
    <motion.div 
      className={`${styles.widget} ${styles.widgetFull}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className={styles.widgetHeader}>
        <div className={styles.widgetTitle}>
          <Flame size={20} strokeWidth={2.5} className={styles.flameIcon} />
          <span>Sự kiện thu hút</span>
          <span className={styles.subtitle}>(Nhiều tương tác nhất)</span>
        </div>
        <button className={styles.viewAllBtn}>
          Xem tất cả <ChevronRight size={16} />
        </button>
      </div>
      
      <div className={styles.trendingGrid}>
        {events.length === 0 ? (
          <p className={styles.noData}>Chưa có sự kiện trending</p>
        ) : (
          events.map((event, index) => (
            <motion.div 
              key={event._id}
              className={styles.trendingCard}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, boxShadow: '0 8px 25px rgba(0,0,0,0.15)' }}
            >
              <div className={styles.trendingRank}>#{index + 1}</div>
              <img 
                src={event.thumbnail} 
                alt={event.name}
                className={styles.trendingThumb}
              />
              <div className={styles.trendingInfo}>
                <h4 className={styles.trendingName}>{event.name}</h4>
                
                <div className={styles.statsGrid}>
                  <div className={styles.statItem}>
                    <Users size={14} />
                    <span className={styles.statValue}>{event.registrationsCount}</span>
                  </div>
                  <div className={styles.statItem}>
                    <Heart size={14} />
                    <span className={styles.statValue}>{event.likesCount}</span>
                  </div>
                  <div className={styles.statItem}>
                    <MessageSquare size={14} />
                    <span className={styles.statValue}>{event.commentsCount}</span>
                  </div>
                  <div className={styles.statItem}>
                    <Eye size={14} />
                    <span className={styles.statValue}>{event.viewCount > 1000 ? `${(event.viewCount / 1000).toFixed(1)}k` : event.viewCount}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  )
}

// Main Component
function DashboardWidgets() {
  return (
    <div className={styles.widgetsContainer}>
      <div className={styles.widgetsRow}>
        <NewEventsWidget />
        <EventsWithNewPostsWidget />
      </div>
      <TrendingEventsWidget />
    </div>
  )
}

export default DashboardWidgets
