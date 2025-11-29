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
 * Dựa theo API Documentation:
 * - GET /api/events/trending - Sự kiện trending
 * - GET /api/events/upcoming - Sự kiện sắp diễn ra
 * - GET /api/dashboard/admin - Thống kê admin
 */

// Mock data - Sự kiện mới công bố
const newlyPublishedEvents = [
  {
    _id: '1',
    name: 'Chiến dịch dọn rác bãi biển Nha Trang',
    thumbnail: 'https://images.unsplash.com/photo-1617886903355-9354bb57751f?w=100&h=100&fit=crop',
    status: 'approved',
    publishedAt: '2025-11-28T10:00:00Z',
    managerId: { username: 'Nguyễn Văn Minh' },
    category: [{ name: 'Môi trường' }]
  },
  {
    _id: '2',
    name: 'Dạy học miễn phí cho trẻ em vùng cao',
    thumbnail: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=100&h=100&fit=crop',
    status: 'approved',
    publishedAt: '2025-11-27T14:30:00Z',
    managerId: { username: 'Trần Thị Lan' },
    category: [{ name: 'Giáo dục' }]
  },
  {
    _id: '3',
    name: 'Khám bệnh miễn phí cho người nghèo',
    thumbnail: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=100&h=100&fit=crop',
    status: 'approved',
    publishedAt: '2025-11-26T09:15:00Z',
    managerId: { username: 'Lê Văn Hùng' },
    category: [{ name: 'Y tế' }]
  },
  {
    _id: '4',
    name: 'Trồng cây xanh tại công viên Thống Nhất',
    thumbnail: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=100&h=100&fit=crop',
    status: 'approved',
    publishedAt: '2025-11-25T16:45:00Z',
    managerId: { username: 'Phạm Thị Hoa' },
    category: [{ name: 'Môi trường' }]
  }
]

// Mock data - Sự kiện có bài viết mới
const eventsWithNewPosts = [
  {
    _id: '5',
    name: 'Hiến máu nhân đạo tại Bệnh viện Bạch Mai',
    thumbnail: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=100&h=100&fit=crop',
    newPostsCount: 5,
    latestPost: {
      title: 'Cảm nhận sau lần đầu hiến máu',
      author: { username: 'Hoàng Minh Tuấn' },
      createdAt: '2025-11-28T08:30:00Z'
    }
  },
  {
    _id: '6',
    name: 'Hỗ trợ nạn nhân lũ lụt miền Trung',
    thumbnail: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=100&h=100&fit=crop',
    newPostsCount: 12,
    latestPost: {
      title: 'Chuyến đi cứu trợ đầy ý nghĩa',
      author: { username: 'Vũ Thị Mai' },
      createdAt: '2025-11-27T20:15:00Z'
    }
  },
  {
    _id: '7',
    name: 'Xây nhà tình thương cho người nghèo',
    thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop',
    newPostsCount: 8,
    latestPost: {
      title: 'Hoàn thành ngôi nhà thứ 10',
      author: { username: 'Đặng Văn Nam' },
      createdAt: '2025-11-27T15:00:00Z'
    }
  }
]

// Mock data - Sự kiện thu hút (trending)
const trendingEvents = [
  {
    _id: '8',
    name: 'Chạy bộ gây quỹ cho trẻ em ung thư',
    thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop',
    likesCount: 1250,
    likesGrowth: 156, // Tăng trong 24h
    registrationsCount: 850,
    registrationsGrowth: 89,
    commentsCount: 234,
    commentsGrowth: 45,
    viewCount: 15600
  },
  {
    _id: '9',
    name: 'Phát cơm miễn phí cho người vô gia cư',
    thumbnail: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=100&h=100&fit=crop',
    likesCount: 980,
    likesGrowth: 124,
    registrationsCount: 620,
    registrationsGrowth: 67,
    commentsCount: 189,
    commentsGrowth: 32,
    viewCount: 12400
  },
  {
    _id: '10',
    name: 'Dọn vệ sinh kênh Nhiêu Lộc',
    thumbnail: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=100&h=100&fit=crop',
    likesCount: 756,
    likesGrowth: 98,
    registrationsCount: 450,
    registrationsGrowth: 54,
    commentsCount: 145,
    commentsGrowth: 28,
    viewCount: 9800
  },
  {
    _id: '11',
    name: 'Tặng quà Tết cho trẻ em mồ côi',
    thumbnail: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=100&h=100&fit=crop',
    likesCount: 2100,
    likesGrowth: 245,
    registrationsCount: 1200,
    registrationsGrowth: 156,
    commentsCount: 356,
    commentsGrowth: 67,
    viewCount: 25600
  }
]

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
        {newlyPublishedEvents.map((event, index) => (
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
                <span className={styles.organizer}>{event.managerId.username}</span>
              </div>
              <div className={styles.publishedTime}>
                <Clock size={12} />
                <span>{formatRelativeTime(event.publishedAt)}</span>
              </div>
            </div>
            <span className={styles.newBadge}>Mới</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// Component Widget: Sự kiện có bài viết mới
function EventsWithNewPostsWidget() {
  return (
    <motion.div 
      className={styles.widget}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className={styles.widgetHeader}>
        <div className={styles.widgetTitle}>
          <FileText size={20} strokeWidth={2.5} />
          <span>Có tin bài mới</span>
        </div>
        <button className={styles.viewAllBtn}>
          Xem tất cả <ChevronRight size={16} />
        </button>
      </div>
      
      <div className={styles.widgetContent}>
        {eventsWithNewPosts.map((event, index) => (
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
                <MessageSquare size={12} />
                <span className={styles.postTitle}>{event.latestPost.title}</span>
              </div>
              <div className={styles.eventMeta}>
                <span className={styles.author}>bởi {event.latestPost.author.username}</span>
                <span className={styles.separator}>•</span>
                <span>{formatRelativeTime(event.latestPost.createdAt)}</span>
              </div>
            </div>
            <span className={styles.postCountBadge}>
              +{event.newPostsCount} bài
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// Component Widget: Sự kiện thu hút (Trending)
function TrendingEventsWidget() {
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
          <span className={styles.subtitle}>(Tăng trưởng nhanh trong 24h)</span>
        </div>
        <button className={styles.viewAllBtn}>
          Xem tất cả <ChevronRight size={16} />
        </button>
      </div>
      
      <div className={styles.trendingGrid}>
        {trendingEvents.map((event, index) => (
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
                  <span className={styles.statGrowth}>+{event.registrationsGrowth}</span>
                </div>
                <div className={styles.statItem}>
                  <Heart size={14} />
                  <span className={styles.statValue}>{event.likesCount}</span>
                  <span className={styles.statGrowth}>+{event.likesGrowth}</span>
                </div>
                <div className={styles.statItem}>
                  <MessageSquare size={14} />
                  <span className={styles.statValue}>{event.commentsCount}</span>
                  <span className={styles.statGrowth}>+{event.commentsGrowth}</span>
                </div>
                <div className={styles.statItem}>
                  <Eye size={14} />
                  <span className={styles.statValue}>{(event.viewCount / 1000).toFixed(1)}k</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
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
