import mongoose from 'mongoose';

// Schema cho định nghĩa các Level/Rank (do Admin cấu hình)
const levelDefinitionSchema = new mongoose.Schema(
  {
    level: { type: Number, required: true, unique: true, min: 1 },
    name: { type: String, required: true, trim: true }, // VD: "Tân Binh", "Chiến Binh", "Chiến Tướng"
    title: { type: String, trim: true }, // Title ngắn gọn
    description: { type: String, trim: true },
    // Điểm cần để đạt level này
    pointsRequired: { type: Number, required: true, min: 0 },
    // Icon/Badge cho level
    icon: { type: String, default: '⭐' },
    color: { type: String, default: '#4CAF50' },
    // Badge image URL (optional)
    badgeImage: { type: String },
    // Perks/Benefits khi đạt level này
    perks: [{ type: String, trim: true }],
    // Có đang active không
    isActive: { type: Boolean, default: true }
  },
  {
    timestamps: true
  }
);

// Schema cho User Progress (điểm và level của user)
const userProgressSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'user', 
      required: true,
      unique: true
    },
    // Tổng điểm tích lũy
    totalPoints: { type: Number, default: 0, min: 0 },
    // Level hiện tại
    currentLevel: { type: Number, default: 1, min: 1 },
    // Điểm trong level hiện tại (để tính progress bar)
    currentLevelPoints: { type: Number, default: 0, min: 0 },
    // Thống kê chi tiết
    stats: {
      eventsCompleted: { type: Number, default: 0, min: 0 },
      hoursVolunteered: { type: Number, default: 0, min: 0 },
      eventsHosted: { type: Number, default: 0, min: 0 },
      consecutiveEvents: { type: Number, default: 0, min: 0 },
      maxConsecutiveEvents: { type: Number, default: 0, min: 0 },
      // Theo danh mục
      categoryStats: [{
        categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'category' },
        eventsCompleted: { type: Number, default: 0 }
      }]
    },
    // Streak tracking
    lastEventDate: { type: Date },
    currentStreak: { type: Number, default: 0, min: 0 },
    longestStreak: { type: Number, default: 0, min: 0 }
  },
  {
    timestamps: true
  }
);

// Schema cho Point History (lịch sử điểm)
const pointHistorySchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'user', 
      required: true 
    },
    // Số điểm thay đổi (có thể âm nếu trừ điểm)
    points: { type: Number, required: true },
    // Loại giao dịch
    type: {
      type: String,
      enum: [
        'event_completed',      // Hoàn thành sự kiện
        'achievement_earned',   // Đạt achievement
        'level_bonus',          // Bonus khi lên level
        'event_hosted',         // Tổ chức sự kiện thành công
        'streak_bonus',         // Bonus streak
        'admin_adjustment',     // Admin điều chỉnh
        'referral_bonus'        // Bonus giới thiệu
      ],
      required: true
    },
    // Mô tả chi tiết
    description: { type: String, trim: true },
    // Reference đến entity liên quan
    relatedEvent: { type: mongoose.Schema.Types.ObjectId, ref: 'event' },
    relatedAchievement: { type: mongoose.Schema.Types.ObjectId, ref: 'achievementDefinition' }
  },
  {
    timestamps: true
  }
);

// Indexes
levelDefinitionSchema.index({ level: 1 });
levelDefinitionSchema.index({ pointsRequired: 1 });
levelDefinitionSchema.index({ isActive: 1 });

userProgressSchema.index({ userId: 1 });
userProgressSchema.index({ currentLevel: -1 });
userProgressSchema.index({ totalPoints: -1 });

pointHistorySchema.index({ userId: 1, createdAt: -1 });
pointHistorySchema.index({ userId: 1, type: 1 });

const LevelDefinition = mongoose.models.levelDefinition || 
  mongoose.model('levelDefinition', levelDefinitionSchema);

const UserProgress = mongoose.models.userProgress || 
  mongoose.model('userProgress', userProgressSchema);

const PointHistory = mongoose.models.pointHistory || 
  mongoose.model('pointHistory', pointHistorySchema);

export { LevelDefinition, UserProgress, PointHistory };
