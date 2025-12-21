import { AchievementDefinition, UserAchievement } from '../../models/achievementModel.js';
import { LevelDefinition, UserProgress, PointHistory } from '../../models/levelModel.js';
import User from '../../models/userModel.js';
import { invalidateCacheByPattern } from '../../utils/cacheHelper.js';

// ==================== ACHIEVEMENT MANAGEMENT ====================

/**
 * Tạo achievement mới
 */
export async function createAchievement(req, res) {
  try {
    const { name, slug, description, icon, color, category, criteria, pointsReward, rarity, displayOrder } = req.body;

    // Check slug unique
    const existing = await AchievementDefinition.findOne({ slug });
    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: 'Achievement with this slug already exists' 
      });
    }

    const achievement = await AchievementDefinition.create({
      name,
      slug,
      description,
      icon,
      color,
      category,
      criteria,
      pointsReward,
      rarity,
      displayOrder
    });

    await invalidateCacheByPattern('achievements:*');

    res.status(201).json({
      success: true,
      message: 'Achievement created successfully',
      data: achievement
    });
  } catch (error) {
    console.error('Error creating achievement:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

/**
 * Cập nhật achievement
 */
export async function updateAchievement(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if updating slug to existing one
    if (updates.slug) {
      const existing = await AchievementDefinition.findOne({ 
        slug: updates.slug, 
        _id: { $ne: id } 
      });
      if (existing) {
        return res.status(400).json({ 
          success: false, 
          message: 'Achievement with this slug already exists' 
        });
      }
    }

    const achievement = await AchievementDefinition.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!achievement) {
      return res.status(404).json({ success: false, message: 'Achievement not found' });
    }

    await invalidateCacheByPattern('achievements:*');

    res.status(200).json({
      success: true,
      message: 'Achievement updated successfully',
      data: achievement
    });
  } catch (error) {
    console.error('Error updating achievement:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

/**
 * Xóa achievement
 */
export async function deleteAchievement(req, res) {
  try {
    const { id } = req.params;

    // Check if any user has this achievement
    const userAchievementCount = await UserAchievement.countDocuments({ achievementId: id });
    
    if (userAchievementCount > 0) {
      // Soft delete - just deactivate
      await AchievementDefinition.findByIdAndUpdate(id, { isActive: false });
      return res.status(200).json({
        success: true,
        message: `Achievement deactivated (${userAchievementCount} users have this achievement)`
      });
    }

    // Hard delete if no users have it
    const achievement = await AchievementDefinition.findByIdAndDelete(id);
    if (!achievement) {
      return res.status(404).json({ success: false, message: 'Achievement not found' });
    }

    await invalidateCacheByPattern('achievements:*');

    res.status(200).json({
      success: true,
      message: 'Achievement deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting achievement:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

/**
 * Lấy tất cả achievements (admin view - bao gồm cả inactive)
 */
export async function getAllAchievementsAdmin(req, res) {
  try {
    const { page = 1, limit = 20, category, rarity, isActive } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {};
    if (category) filter.category = category;
    if (rarity) filter.rarity = rarity;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const [achievements, total] = await Promise.all([
      AchievementDefinition.find(filter)
        .sort({ displayOrder: 1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      AchievementDefinition.countDocuments(filter)
    ]);

    // Get earned count for each achievement
    const achievementIds = achievements.map(a => a._id);
    const earnedCounts = await UserAchievement.aggregate([
      { $match: { achievementId: { $in: achievementIds }, isCompleted: true } },
      { $group: { _id: '$achievementId', count: { $sum: 1 } } }
    ]);

    const countMap = earnedCounts.reduce((acc, item) => {
      acc[item._id.toString()] = item.count;
      return acc;
    }, {});

    const achievementsWithStats = achievements.map(a => ({
      ...a,
      earnedCount: countMap[a._id.toString()] || 0
    }));

    res.status(200).json({
      success: true,
      data: achievementsWithStats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error getting achievements:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

/**
 * Trao achievement cho user (manual)
 */
export async function awardAchievementToUser(req, res) {
  try {
    const { achievementId, userId, reason, eventId } = req.body;
    const adminId = req.user._id;

    // Verify achievement exists
    const achievement = await AchievementDefinition.findById(achievementId);
    if (!achievement) {
      return res.status(404).json({ success: false, message: 'Achievement not found' });
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if user already has this achievement
    const existing = await UserAchievement.findOne({ userId, achievementId });
    if (existing?.isCompleted) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already has this achievement' 
      });
    }

    // Create or update user achievement
    const userAchievement = await UserAchievement.findOneAndUpdate(
      { userId, achievementId },
      {
        userId,
        achievementId,
        eventId,
        awardedBy: adminId,
        awardReason: reason,
        progress: achievement.criteria?.threshold || 1,
        isCompleted: true,
        completedAt: new Date()
      },
      { upsert: true, new: true }
    );

    // Add points to user
    if (achievement.pointsReward > 0) {
      await addPointsToUser(userId, achievement.pointsReward, 'achievement_earned', 
        `Earned achievement: ${achievement.name}`, null, achievementId);
    }

    // Update user's achievement count
    await User.findByIdAndUpdate(userId, {
      $inc: { 'gamification.achievementCount': 1 }
    });

    res.status(200).json({
      success: true,
      message: `Achievement "${achievement.name}" awarded to user successfully`,
      data: userAchievement
    });
  } catch (error) {
    console.error('Error awarding achievement:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// ==================== LEVEL MANAGEMENT ====================

/**
 * Tạo level mới
 */
export async function createLevel(req, res) {
  try {
    const { level, name, title, description, pointsRequired, icon, color, badgeImage, perks } = req.body;

    // Check level number unique
    const existing = await LevelDefinition.findOne({ level });
    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: 'Level with this number already exists' 
      });
    }

    const newLevel = await LevelDefinition.create({
      level,
      name,
      title,
      description,
      pointsRequired,
      icon,
      color,
      badgeImage,
      perks
    });

    await invalidateCacheByPattern('levels:*');

    res.status(201).json({
      success: true,
      message: 'Level created successfully',
      data: newLevel
    });
  } catch (error) {
    console.error('Error creating level:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

/**
 * Cập nhật level
 */
export async function updateLevel(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    // If updating level number, check uniqueness
    if (updates.level) {
      const existing = await LevelDefinition.findOne({ 
        level: updates.level, 
        _id: { $ne: id } 
      });
      if (existing) {
        return res.status(400).json({ 
          success: false, 
          message: 'Level with this number already exists' 
        });
      }
    }

    const level = await LevelDefinition.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!level) {
      return res.status(404).json({ success: false, message: 'Level not found' });
    }

    await invalidateCacheByPattern('levels:*');

    res.status(200).json({
      success: true,
      message: 'Level updated successfully',
      data: level
    });
  } catch (error) {
    console.error('Error updating level:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

/**
 * Xóa level
 */
export async function deleteLevel(req, res) {
  try {
    const { id } = req.params;

    const level = await LevelDefinition.findById(id);
    if (!level) {
      return res.status(404).json({ success: false, message: 'Level not found' });
    }

    // Check if any user is at this level
    const usersAtLevel = await UserProgress.countDocuments({ currentLevel: level.level });
    
    if (usersAtLevel > 0) {
      // Soft delete
      await LevelDefinition.findByIdAndUpdate(id, { isActive: false });
      return res.status(200).json({
        success: true,
        message: `Level deactivated (${usersAtLevel} users at this level)`
      });
    }

    await LevelDefinition.findByIdAndDelete(id);
    await invalidateCacheByPattern('levels:*');

    res.status(200).json({
      success: true,
      message: 'Level deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting level:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

/**
 * Lấy tất cả levels (admin view)
 */
export async function getAllLevelsAdmin(req, res) {
  try {
    const levels = await LevelDefinition.find().sort({ level: 1 }).lean();

    // Get user count at each level
    const levelCounts = await UserProgress.aggregate([
      { $group: { _id: '$currentLevel', count: { $sum: 1 } } }
    ]);

    const countMap = levelCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    const levelsWithStats = levels.map(l => ({
      ...l,
      userCount: countMap[l.level] || 0
    }));

    res.status(200).json({
      success: true,
      data: levelsWithStats
    });
  } catch (error) {
    console.error('Error getting levels:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

/**
 * Điều chỉnh điểm của user (admin)
 */
export async function adjustUserPoints(req, res) {
  try {
    const { userId, points, reason } = req.body;

    if (!points || points === 0) {
      return res.status(400).json({ success: false, message: 'Points must be non-zero' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await addPointsToUser(
      userId, 
      points, 
      'admin_adjustment', 
      reason || `Admin adjustment by ${req.user.username}`
    );

    const updatedProgress = await UserProgress.findOne({ userId });

    res.status(200).json({
      success: true,
      message: `${points > 0 ? 'Added' : 'Removed'} ${Math.abs(points)} points`,
      data: {
        totalPoints: updatedProgress.totalPoints,
        currentLevel: updatedProgress.currentLevel
      }
    });
  } catch (error) {
    console.error('Error adjusting user points:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

/**
 * Lấy thống kê gamification tổng quan
 */
export async function getGamificationStats(req, res) {
  try {
    const [
      totalUsers,
      totalAchievements,
      totalLevels,
      achievementDistribution,
      levelDistribution,
      topEarners
    ] = await Promise.all([
      UserProgress.countDocuments(),
      AchievementDefinition.countDocuments({ isActive: true }),
      LevelDefinition.countDocuments({ isActive: true }),
      UserAchievement.aggregate([
        { $match: { isCompleted: true } },
        { $group: { _id: '$achievementId', count: { $sum: 1 } } },
        { $lookup: { from: 'achievementdefinitions', localField: '_id', foreignField: '_id', as: 'achievement' } },
        { $unwind: '$achievement' },
        { $project: { name: '$achievement.name', count: 1 } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      UserProgress.aggregate([
        { $group: { _id: '$currentLevel', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      UserProgress.find()
        .sort({ totalPoints: -1 })
        .limit(5)
        .populate('userId', 'username avatar')
        .lean()
    ]);

    // Get total points earned
    const totalPointsResult = await PointHistory.aggregate([
      { $match: { points: { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: '$points' } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalAchievements,
          totalLevels,
          totalPointsEarned: totalPointsResult[0]?.total || 0
        },
        achievementDistribution,
        levelDistribution,
        topEarners: topEarners.map((e, i) => ({
          rank: i + 1,
          user: e.userId,
          totalPoints: e.totalPoints,
          currentLevel: e.currentLevel
        }))
      }
    });
  } catch (error) {
    console.error('Error getting gamification stats:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

/**
 * Seed default levels (initial setup)
 */
export async function seedDefaultLevels(req, res) {
  try {
    const existingLevels = await LevelDefinition.countDocuments();
    if (existingLevels > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Levels already exist. Delete all levels first to reseed.' 
      });
    }

    const defaultLevels = [
      { level: 1, name: 'Tân Binh', title: 'Newbie', description: 'Bắt đầu hành trình tình nguyện', pointsRequired: 0, icon: '🌱', color: '#9E9E9E', perks: ['Được tham gia các sự kiện cơ bản'] },
      { level: 2, name: 'Chiến Binh', title: 'Warrior', description: 'Đã hoàn thành một số sự kiện', pointsRequired: 100, icon: '⚔️', color: '#8BC34A', perks: ['Được ưu tiên đăng ký sự kiện', 'Badge Chiến Binh'] },
      { level: 3, name: 'Dũng Sĩ', title: 'Brave', description: 'Tình nguyện viên tích cực', pointsRequired: 300, icon: '🛡️', color: '#03A9F4', perks: ['Tham gia sự kiện đặc biệt', 'Badge Dũng Sĩ'] },
      { level: 4, name: 'Hiệp Sĩ', title: 'Knight', description: 'Tình nguyện viên nổi bật', pointsRequired: 600, icon: '🏇', color: '#9C27B0', perks: ['Được đề cử làm team leader', 'Badge Hiệp Sĩ', 'Tham gia sự kiện VIP'] },
      { level: 5, name: 'Chiến Tướng', title: 'General', description: 'Tình nguyện viên xuất sắc', pointsRequired: 1000, icon: '👑', color: '#FF9800', perks: ['Quyền tổ chức sự kiện riêng', 'Badge Chiến Tướng', 'Ưu tiên cao nhất'] },
      { level: 6, name: 'Anh Hùng', title: 'Hero', description: 'Huyền thoại tình nguyện', pointsRequired: 1500, icon: '🦸', color: '#F44336', perks: ['Tất cả quyền lợi', 'Badge Anh Hùng', 'Được vinh danh'] },
      { level: 7, name: 'Huyền Thoại', title: 'Legend', description: 'Đỉnh cao tình nguyện', pointsRequired: 2500, icon: '🌟', color: '#FFD700', perks: ['Danh hiệu vĩnh viễn', 'Badge Huyền Thoại', 'Quyền lợi trọn đời'] }
    ];

    await LevelDefinition.insertMany(defaultLevels);
    await invalidateCacheByPattern('levels:*');

    res.status(201).json({
      success: true,
      message: 'Default levels created successfully',
      data: defaultLevels
    });
  } catch (error) {
    console.error('Error seeding levels:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

/**
 * Seed default achievements (initial setup)
 * Categories:
 * - participation: Basic participation achievements (auto)
 * - contribution: Based on contribution quality (manual - manager awarded)
 * - role: Based on role/responsibility (manual - manager awarded)
 * - milestone: Based on event count milestones (auto)
 * - special: Special recognition (manual - manager awarded)
 */
export async function seedDefaultAchievements(req, res) {
  try {
    const existingAchievements = await AchievementDefinition.countDocuments();
    if (existingAchievements > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Achievements already exist. Delete all achievements first to reseed.' 
      });
    }

    const defaultAchievements = [
      // ============ PARTICIPATION - Auto awarded based on event count ============
      { 
        name: 'First Step', 
        slug: 'first-step', 
        description: 'Complete your first volunteer event', 
        icon: '👣', 
        color: '#4CAF50', 
        category: 'participation', 
        criteria: { type: 'events_completed', threshold: 1 }, 
        pointsReward: 10, 
        rarity: 'common', 
        displayOrder: 1 
      },
      { 
        name: 'Getting Started', 
        slug: 'getting-started', 
        description: 'Complete 3 volunteer events', 
        icon: '🌱', 
        color: '#8BC34A', 
        category: 'participation', 
        criteria: { type: 'events_completed', threshold: 3 }, 
        pointsReward: 25, 
        rarity: 'common', 
        displayOrder: 2 
      },
      { 
        name: 'Active Helper', 
        slug: 'active-helper', 
        description: 'Complete 5 volunteer events', 
        icon: '💪', 
        color: '#2196F3', 
        category: 'participation', 
        criteria: { type: 'events_completed', threshold: 5 }, 
        pointsReward: 50, 
        rarity: 'uncommon', 
        displayOrder: 3 
      },

      // ============ MILESTONE - Auto awarded at major milestones ============
      { 
        name: 'Dedicated Volunteer', 
        slug: 'dedicated-volunteer', 
        description: 'Complete 10 volunteer events', 
        icon: '⭐', 
        color: '#FF9800', 
        category: 'milestone', 
        criteria: { type: 'events_completed', threshold: 10 }, 
        pointsReward: 100, 
        rarity: 'uncommon', 
        displayOrder: 10 
      },
      { 
        name: 'Community Champion', 
        slug: 'community-champion', 
        description: 'Complete 25 volunteer events', 
        icon: '🏅', 
        color: '#9C27B0', 
        category: 'milestone', 
        criteria: { type: 'events_completed', threshold: 25 }, 
        pointsReward: 200, 
        rarity: 'rare', 
        displayOrder: 11 
      },
      { 
        name: 'Volunteer Hero', 
        slug: 'volunteer-hero', 
        description: 'Complete 50 volunteer events', 
        icon: '🦸', 
        color: '#E91E63', 
        category: 'milestone', 
        criteria: { type: 'events_completed', threshold: 50 }, 
        pointsReward: 400, 
        rarity: 'epic', 
        displayOrder: 12 
      },
      { 
        name: 'Volunteer Legend', 
        slug: 'volunteer-legend', 
        description: 'Complete 100 volunteer events', 
        icon: '👑', 
        color: '#FFD700', 
        category: 'milestone', 
        criteria: { type: 'events_completed', threshold: 100 }, 
        pointsReward: 1000, 
        rarity: 'legendary', 
        displayOrder: 13 
      },

      // ============ CONTRIBUTION - Manual (Manager awarded for contribution quality) ============
      { 
        name: 'Hard Worker', 
        slug: 'hard-worker', 
        description: 'Recognized for exceptional effort and dedication', 
        icon: '💪', 
        color: '#FF5722', 
        category: 'contribution', 
        criteria: { type: 'manual' }, 
        pointsReward: 30, 
        rarity: 'common', 
        displayOrder: 20 
      },
      { 
        name: 'Outstanding Contributor', 
        slug: 'outstanding-contributor', 
        description: 'Delivered exceptional work beyond expectations', 
        icon: '🌟', 
        color: '#FFC107', 
        category: 'contribution', 
        criteria: { type: 'manual' }, 
        pointsReward: 50, 
        rarity: 'uncommon', 
        displayOrder: 21 
      },
      { 
        name: 'Above and Beyond', 
        slug: 'above-and-beyond', 
        description: 'Went the extra mile to make the event successful', 
        icon: '🚀', 
        color: '#9C27B0', 
        category: 'contribution', 
        criteria: { type: 'manual' }, 
        pointsReward: 75, 
        rarity: 'rare', 
        displayOrder: 22 
      },
      { 
        name: 'MVP', 
        slug: 'mvp', 
        description: 'Most Valuable Participant of the event', 
        icon: '🏆', 
        color: '#FFD700', 
        category: 'contribution', 
        criteria: { type: 'manual' }, 
        pointsReward: 100, 
        rarity: 'epic', 
        displayOrder: 23 
      },

      // ============ ROLE - Manual (Manager awarded for specific roles) ============
      { 
        name: 'Team Leader', 
        slug: 'team-leader', 
        description: 'Successfully led a volunteer team', 
        icon: '👨‍💼', 
        color: '#3F51B5', 
        category: 'role', 
        criteria: { type: 'manual' }, 
        pointsReward: 60, 
        rarity: 'uncommon', 
        displayOrder: 30 
      },
      { 
        name: 'Coordinator', 
        slug: 'coordinator', 
        description: 'Helped coordinate event activities effectively', 
        icon: '📋', 
        color: '#00BCD4', 
        category: 'role', 
        criteria: { type: 'manual' }, 
        pointsReward: 50, 
        rarity: 'uncommon', 
        displayOrder: 31 
      },
      { 
        name: 'Mentor', 
        slug: 'mentor', 
        description: 'Guided and supported new volunteers', 
        icon: '🎓', 
        color: '#673AB7', 
        category: 'role', 
        criteria: { type: 'manual' }, 
        pointsReward: 55, 
        rarity: 'uncommon', 
        displayOrder: 32 
      },
      { 
        name: 'Problem Solver', 
        slug: 'problem-solver', 
        description: 'Resolved challenges and kept things running smoothly', 
        icon: '🔧', 
        color: '#607D8B', 
        category: 'role', 
        criteria: { type: 'manual' }, 
        pointsReward: 45, 
        rarity: 'uncommon', 
        displayOrder: 33 
      },
      { 
        name: 'Spirit Lifter', 
        slug: 'spirit-lifter', 
        description: 'Brought positive energy and boosted team morale', 
        icon: '🎉', 
        color: '#E91E63', 
        category: 'role', 
        criteria: { type: 'manual' }, 
        pointsReward: 40, 
        rarity: 'common', 
        displayOrder: 34 
      },

      // ============ SPECIAL - Manual (Special recognition) ============
      { 
        name: 'Rising Star', 
        slug: 'rising-star', 
        description: 'New volunteer showing great promise', 
        icon: '⭐', 
        color: '#FFEB3B', 
        category: 'special', 
        criteria: { type: 'manual' }, 
        pointsReward: 40, 
        rarity: 'uncommon', 
        displayOrder: 40 
      },
      { 
        name: 'Community Impact', 
        slug: 'community-impact', 
        description: 'Made significant positive impact on the community', 
        icon: '🌍', 
        color: '#4CAF50', 
        category: 'special', 
        criteria: { type: 'manual' }, 
        pointsReward: 80, 
        rarity: 'rare', 
        displayOrder: 41 
      },
      { 
        name: 'Inspiring Leader', 
        slug: 'inspiring-leader', 
        description: 'Inspired others through leadership and example', 
        icon: '🔥', 
        color: '#FF5722', 
        category: 'special', 
        criteria: { type: 'manual' }, 
        pointsReward: 100, 
        rarity: 'epic', 
        displayOrder: 42 
      },
      { 
        name: 'Excellence Award', 
        slug: 'excellence-award', 
        description: 'The highest recognition for exceptional service', 
        icon: '💎', 
        color: '#00BCD4', 
        category: 'special', 
        criteria: { type: 'manual' }, 
        pointsReward: 150, 
        rarity: 'legendary', 
        displayOrder: 43 
      }
    ];

    await AchievementDefinition.insertMany(defaultAchievements);
    await invalidateCacheByPattern('achievements:*');

    res.status(201).json({
      success: true,
      message: 'Default achievements created successfully',
      data: defaultAchievements
    });
  } catch (error) {
    console.error('Error seeding achievements:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Add points to user and handle level up
 */
export async function addPointsToUser(userId, points, type, description, eventId = null, achievementId = null) {
  // Get or create user progress
  let userProgress = await UserProgress.findOne({ userId });
  if (!userProgress) {
    userProgress = await UserProgress.create({ userId });
  }

  // Add points
  userProgress.totalPoints += points;
  if (userProgress.totalPoints < 0) userProgress.totalPoints = 0;

  // Check for level up
  const newLevel = await calculateLevel(userProgress.totalPoints);
  const leveledUp = newLevel > userProgress.currentLevel;
  
  if (leveledUp) {
    userProgress.currentLevel = newLevel;
    
    // Update user model as well
    await User.findByIdAndUpdate(userId, {
      'gamification.currentLevel': newLevel,
      'gamification.totalPoints': userProgress.totalPoints
    });
  } else {
    await User.findByIdAndUpdate(userId, {
      'gamification.totalPoints': userProgress.totalPoints
    });
  }

  await userProgress.save();

  // Record point history
  await PointHistory.create({
    userId,
    points,
    type,
    description,
    relatedEvent: eventId,
    relatedAchievement: achievementId
  });

  return { userProgress, leveledUp, newLevel };
}

/**
 * Calculate level based on points
 */
async function calculateLevel(points) {
  const levels = await LevelDefinition.find({ isActive: true })
    .sort({ pointsRequired: -1 })
    .lean();

  for (const level of levels) {
    if (points >= level.pointsRequired) {
      return level.level;
    }
  }

  return 1;
}
