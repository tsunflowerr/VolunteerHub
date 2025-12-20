import { AchievementDefinition, UserAchievement } from '../../models/achievementModel.js';
import { LevelDefinition, UserProgress, PointHistory } from '../../models/levelModel.js';
import User from '../../models/userModel.js';
import Registration from '../../models/registrationsModel.js';
import mongoose from 'mongoose';

/**
 * Lấy thông tin gamification của user (profile, level, achievements)
 */
export async function getUserGamificationProfile(req, res) {
  try {
    const userId = req.params.userId || req.user._id;

    // Lấy user progress
    let userProgress = await UserProgress.findOne({ userId })
      .populate('stats.categoryStats.categoryId', 'name slug color');

    // Nếu chưa có progress, tạo mới
    if (!userProgress) {
      userProgress = await UserProgress.create({ userId });
    }

    // Lấy level hiện tại và level tiếp theo
    const [currentLevelInfo, nextLevelInfo, allLevels] = await Promise.all([
      LevelDefinition.findOne({ level: userProgress.currentLevel, isActive: true }),
      LevelDefinition.findOne({ level: userProgress.currentLevel + 1, isActive: true }),
      LevelDefinition.find({ isActive: true }).sort({ level: 1 }).lean()
    ]);

    // Tính progress đến level tiếp theo
    let progressToNextLevel = 100;
    let pointsToNextLevel = 0;
    
    if (nextLevelInfo) {
      const currentLevelPoints = currentLevelInfo?.pointsRequired || 0;
      const nextLevelPoints = nextLevelInfo.pointsRequired;
      const pointsInCurrentLevel = userProgress.totalPoints - currentLevelPoints;
      const pointsNeededForNextLevel = nextLevelPoints - currentLevelPoints;
      
      progressToNextLevel = Math.min(100, Math.floor((pointsInCurrentLevel / pointsNeededForNextLevel) * 100));
      pointsToNextLevel = nextLevelPoints - userProgress.totalPoints;
    }

    // Lấy achievements đã hoàn thành (group by achievementId)
    const completedAchievementsRaw = await UserAchievement.find({ 
      userId, 
      isCompleted: true 
    })
      .populate('achievementId')
      .sort({ completedAt: -1 })
      .lean();

    // Group achievements and count times awarded
    const achievementMap = {};
    completedAchievementsRaw.forEach(ua => {
      const achId = ua.achievementId._id.toString();
      if (!achievementMap[achId]) {
        achievementMap[achId] = {
          ...ua,
          timesAwarded: 1,
          allCompletions: [ua]
        };
      } else {
        achievementMap[achId].timesAwarded += 1;
        achievementMap[achId].allCompletions.push(ua);
      }
    });

    const completedAchievements = Object.values(achievementMap);

    // Lấy achievements đang tiến hành
    const inProgressAchievements = await UserAchievement.find({ 
      userId, 
      isCompleted: false 
    })
      .populate('achievementId')
      .lean();

    // Lấy ranking của user
    const ranking = await UserProgress.countDocuments({
      totalPoints: { $gt: userProgress.totalPoints }
    }) + 1;

    res.status(200).json({
      success: true,
      data: {
        progress: {
          totalPoints: userProgress.totalPoints,
          currentLevel: userProgress.currentLevel,
          currentLevelInfo,
          nextLevelInfo,
          progressToNextLevel,
          pointsToNextLevel,
          stats: userProgress.stats,
          streak: {
            current: userProgress.currentStreak,
            longest: userProgress.longestStreak
          }
        },
        achievements: {
          completed: completedAchievements,
          inProgress: inProgressAchievements,
          totalCount: completedAchievements.length
        },
        ranking,
        allLevels
      }
    });
  } catch (error) {
    console.error('Error getting user gamification profile:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

/**
 * Lấy tất cả achievements
 */
export async function getAllAchievements(req, res) {
  try {
    const { category, rarity } = req.query;
    const userId = req.user?._id;

    const filter = { isActive: true };
    if (category) filter.category = category;
    if (rarity) filter.rarity = rarity;

    const achievements = await AchievementDefinition.find(filter)
      .sort({ displayOrder: 1, rarity: 1 })
      .lean();

    // Nếu user đã login, lấy thông tin progress của họ
    let userAchievements = [];
    if (userId) {
      userAchievements = await UserAchievement.find({ userId }).lean();
    }

    // Map achievements với user progress (group by achievementId and count)
    const achievementsWithProgress = achievements.map(achievement => {
      const userAchievementsForThis = userAchievements.filter(
        ua => ua.achievementId.toString() === achievement._id.toString()
      );
      
      const completedAchievements = userAchievementsForThis.filter(ua => ua.isCompleted);
      const timesAwarded = completedAchievements.length;
      const latestAchievement = completedAchievements.sort((a, b) => 
        new Date(b.completedAt) - new Date(a.completedAt)
      )[0];
      
      return {
        ...achievement,
        userProgress: latestAchievement ? {
          progress: latestAchievement.progress,
          isCompleted: true,
          completedAt: latestAchievement.completedAt,
          timesAwarded: timesAwarded
        } : null
      };
    });

    res.status(200).json({
      success: true,
      data: achievementsWithProgress
    });
  } catch (error) {
    console.error('Error getting achievements:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

/**
 * Lấy tất cả levels
 */
export async function getAllLevels(req, res) {
  try {
    const levels = await LevelDefinition.find({ isActive: true })
      .sort({ level: 1 })
      .lean();

    res.status(200).json({
      success: true,
      data: levels
    });
  } catch (error) {
    console.error('Error getting levels:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

/**
 * Lấy leaderboard
 */
export async function getLeaderboard(req, res) {
  try {
    const { limit = 10, type = 'points' } = req.query;
    const limitNum = Math.min(parseInt(limit) || 10, 100);

    let sortField = 'totalPoints';
    if (type === 'level') sortField = 'currentLevel';
    if (type === 'events') sortField = 'stats.eventsCompleted';

    const leaderboard = await UserProgress.find()
      .sort({ [sortField]: -1 })
      .limit(limitNum)
      .populate('userId', 'username avatar role gamification')
      .lean();

    // Lấy level info cho mỗi user
    const levelIds = [...new Set(leaderboard.map(l => l.currentLevel))];
    const levels = await LevelDefinition.find({ 
      level: { $in: levelIds }, 
      isActive: true 
    }).lean();
    
    const levelMap = levels.reduce((acc, level) => {
      acc[level.level] = level;
      return acc;
    }, {});

    const leaderboardWithLevels = leaderboard.map((entry, index) => ({
      rank: index + 1,
      user: entry.userId,
      totalPoints: entry.totalPoints,
      currentLevel: entry.currentLevel,
      levelInfo: levelMap[entry.currentLevel],
      stats: {
        ...entry.stats,
        achievementCount: entry.userId?.gamification?.achievementCount || 0
      }
    }));

    res.status(200).json({
      success: true,
      data: leaderboardWithLevels
    });
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

/**
 * Lấy lịch sử điểm của user
 */
export async function getPointHistory(req, res) {
  try {
    const userId = req.params.userId || req.user._id;
    const { page = 1, limit = 20, type } = req.query;

    const filter = { userId };
    if (type) filter.type = type;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [history, total] = await Promise.all([
      PointHistory.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('relatedEvent', 'name thumbnail')
        .populate('relatedAchievement', 'name icon')
        .lean(),
      PointHistory.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: history,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error getting point history:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

/**
 * Cập nhật featured achievements trên profile
 */
export async function updateFeaturedAchievements(req, res) {
  try {
    const userId = req.user._id;
    const { achievementIds } = req.body;

    if (!Array.isArray(achievementIds) || achievementIds.length > 5) {
      return res.status(400).json({
        success: false,
        message: 'Achievement IDs must be an array with maximum 5 items'
      });
    }

    // Verify user has these achievements
    const userAchievements = await UserAchievement.find({
      userId,
      achievementId: { $in: achievementIds },
      isCompleted: true
    });

    if (userAchievements.length !== achievementIds.length) {
      return res.status(400).json({
        success: false,
        message: 'You can only feature achievements you have earned'
      });
    }

    await User.findByIdAndUpdate(userId, {
      'gamification.featuredAchievements': achievementIds
    });

    res.status(200).json({
      success: true,
      message: 'Featured achievements updated successfully'
    });
  } catch (error) {
    console.error('Error updating featured achievements:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

/**
 * Kiểm tra user có đủ điều kiện đăng ký event không
 */
export async function checkEventEligibility(req, res) {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;

    const Event = mongoose.model('event');
    const event = await Event.findById(eventId)
      .populate('requirements.requiredAchievements', 'name icon')
      .lean();

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Nếu event không có requirements
    if (!event.requirements?.hasRequirements) {
      return res.status(200).json({
        success: true,
        data: {
          eligible: true,
          requirements: null
        }
      });
    }

    // Lấy user progress
    const userProgress = await UserProgress.findOne({ userId }) || { 
      totalPoints: 0, 
      currentLevel: 1,
      stats: { eventsCompleted: 0 }
    };

    // Kiểm tra từng requirement
    const checks = {
      level: {
        required: event.requirements.minLevel,
        current: userProgress.currentLevel,
        passed: userProgress.currentLevel >= event.requirements.minLevel
      },
      points: {
        required: event.requirements.minPoints,
        current: userProgress.totalPoints,
        passed: userProgress.totalPoints >= event.requirements.minPoints
      },
      eventsCompleted: {
        required: event.requirements.minEventsCompleted,
        current: userProgress.stats?.eventsCompleted || 0,
        passed: (userProgress.stats?.eventsCompleted || 0) >= event.requirements.minEventsCompleted
      }
    };

    // Kiểm tra achievements
    let achievementCheck = { required: [], missing: [], passed: true };
    if (event.requirements.requiredAchievements?.length > 0) {
      const userAchievements = await UserAchievement.find({
        userId,
        achievementId: { $in: event.requirements.requiredAchievements.map(a => a._id) },
        isCompleted: true
      }).lean();

      const earnedIds = userAchievements.map(ua => ua.achievementId.toString());
      achievementCheck.required = event.requirements.requiredAchievements;
      achievementCheck.missing = event.requirements.requiredAchievements.filter(
        a => !earnedIds.includes(a._id.toString())
      );
      achievementCheck.passed = achievementCheck.missing.length === 0;
    }

    const allPassed = checks.level.passed && 
                      checks.points.passed && 
                      checks.eventsCompleted.passed && 
                      achievementCheck.passed;

    res.status(200).json({
      success: true,
      data: {
        eligible: allPassed,
        requirements: {
          ...checks,
          achievements: achievementCheck,
          description: event.requirements.requirementDescription
        }
      }
    });
  } catch (error) {
    console.error('Error checking event eligibility:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}
