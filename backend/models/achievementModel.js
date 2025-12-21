import mongoose from 'mongoose';

// Schema cho định nghĩa các loại Achievement (do Admin tạo)
const achievementDefinitionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { 
      type: String, 
      required: true, 
      unique: true, 
      trim: true,
      lowercase: true 
    },
    description: { type: String, required: true, trim: true },
    icon: { type: String, default: '🏆' }, // Emoji hoặc URL icon
    color: { type: String, default: '#FFD700' }, // Màu badge
    category: {
      type: String,
      enum: ['participation', 'milestone', 'contribution', 'role', 'special'],
      default: 'participation'
    },
    // Điều kiện để đạt được achievement (tự động)
    criteria: {
      type: {
        type: String,
        enum: [
          'events_completed',      // Hoàn thành X sự kiện
          'hours_volunteered',     // Tình nguyện X giờ
          'events_in_category',    // Hoàn thành X sự kiện trong 1 danh mục
          'consecutive_events',    // Hoàn thành X sự kiện liên tiếp
          'first_event',           // Hoàn thành sự kiện đầu tiên
          'events_hosted',         // Tổ chức X sự kiện (cho manager)
          'manual'                 // Trao tay bởi manager/admin
        ],
        default: 'manual'
      },
      threshold: { type: Number, default: 1 }, // Số lượng cần đạt
      categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'category' } // Cho category_master
    },
    // Điểm thưởng khi đạt được
    pointsReward: { type: Number, default: 0, min: 0 },
    // Độ hiếm của achievement
    rarity: {
      type: String,
      enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
      default: 'common'
    },
    // Achievement có đang active không
    isActive: { type: Boolean, default: true },
    // Thứ tự hiển thị
    displayOrder: { type: Number, default: 0 }
  },
  {
    timestamps: true
  }
);

// Schema cho Achievement mà User đã đạt được
const userAchievementSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'user', 
      required: true 
    },
    achievementId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'achievementDefinition', 
      required: true 
    },
    // Event mà user đạt được achievement (nếu có)
    eventId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'event' 
    },
    // Ai trao achievement (nếu manual)
    awardedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'user' 
    },
    // Lý do trao (nếu manual)
    awardReason: { type: String, trim: true },
    // Tiến độ (cho achievement có threshold > 1)
    progress: { type: Number, default: 0 },
    // Đã hoàn thành chưa
    isCompleted: { type: Boolean, default: false },
    // Thời gian hoàn thành
    completedAt: { type: Date },
    // Số lần đạt được achievement này
    timesAwarded: { type: Number, default: 1 },
    // Có hiển thị trên profile không
    isDisplayed: { type: Boolean, default: true }
  },
  {
    timestamps: true
  }
);

// Index cho query nhanh
achievementDefinitionSchema.index({ category: 1, isActive: 1 });
achievementDefinitionSchema.index({ 'criteria.type': 1 });
achievementDefinitionSchema.index({ rarity: 1 });

userAchievementSchema.index({ userId: 1, achievementId: 1 });
userAchievementSchema.index({ userId: 1, isCompleted: 1 });
userAchievementSchema.index({ userId: 1, isDisplayed: 1 });
userAchievementSchema.index({ eventId: 1 });

const AchievementDefinition = mongoose.models.achievementDefinition || 
  mongoose.model('achievementDefinition', achievementDefinitionSchema);

const UserAchievement = mongoose.models.userAchievement || 
  mongoose.model('userAchievement', userAchievementSchema);

export { AchievementDefinition, UserAchievement };
