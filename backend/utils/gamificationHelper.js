import { AchievementDefinition, UserAchievement } from '../models/achievementModel.js';
import { LevelDefinition, UserProgress, PointHistory } from '../models/levelModel.js';
import User from '../models/userModel.js';
import Event from '../models/eventModel.js';
import Registration from '../models/registrationsModel.js';
import { createAndSendNotification } from './notificationHelper.js';

/**
 * Process gamification rewards when a user completes an event
 * @param {string} userId - User ID
 * @param {string} eventId - Event ID
 * @param {Object} options - Additional options
 */
export async function processEventCompletion(userId, eventId, options = {}) {
  try {
    const event = await Event.findById(eventId)
      .populate('categories', '_id name')
      .lean();
    
    if (!event) {
      console.error('Event not found for gamification processing:', eventId);
      return { success: false, error: 'Event not found' };
    }

    // Get or create user progress
    let userProgress = await UserProgress.findOne({ userId });
    if (!userProgress) {
      userProgress = await UserProgress.create({ userId });
    }

    const results = {
      pointsEarned: 0,
      achievementsEarned: [],
      leveledUp: false,
      newLevel: userProgress.currentLevel
    };

    // No automatic points - manager will award points manually via achievements
    // Points can be set in event.rewards.pointsReward as reference for managers

    // 1. Update stats (without awarding points)
    userProgress.stats.eventsCompleted += 1;
    userProgress.stats.hoursVolunteered += (event.rewards?.hoursCredit || 4);

    // Update category stats
    if (event.categories && event.categories.length > 0) {
      for (const category of event.categories) {
        const categoryStatIndex = userProgress.stats.categoryStats.findIndex(
          cs => cs.categoryId?.toString() === category._id.toString()
        );
        
        if (categoryStatIndex >= 0) {
          userProgress.stats.categoryStats[categoryStatIndex].eventsCompleted += 1;
        } else {
          userProgress.stats.categoryStats.push({
            categoryId: category._id,
            eventsCompleted: 1
          });
        }
      }
    }

    // 3. Update streak
    const now = new Date();
    const lastEventDate = userProgress.lastEventDate;
    const daysSinceLastEvent = lastEventDate 
      ? Math.floor((now - lastEventDate) / (1000 * 60 * 60 * 24))
      : 999;

    if (daysSinceLastEvent <= 30) { // Within 30 days considered as streak
      userProgress.currentStreak += 1;
      if (userProgress.currentStreak > userProgress.longestStreak) {
        userProgress.longestStreak = userProgress.currentStreak;
      }
    } else {
      userProgress.currentStreak = 1;
    }
    userProgress.lastEventDate = now;

    // 4. Check and award automatic achievements (including points reward)
    const earnedAchievements = await checkAndAwardAchievements(userId, userProgress, event);
    results.achievementsEarned = earnedAchievements;
    
    // Calculate total points from earned achievements
    results.pointsEarned = earnedAchievements.reduce((sum, ach) => sum + (ach.pointsReward || 0), 0);

    // 5. Check for level up (from accumulated points)
    const newLevelInfo = await calculateLevel(userProgress.totalPoints);
    if (newLevelInfo.level > userProgress.currentLevel) {
      results.leveledUp = true;
      results.newLevel = newLevelInfo.level;
      results.newLevelInfo = newLevelInfo;
      userProgress.currentLevel = newLevelInfo.level;
    }

    // 6. Save user progress
    await userProgress.save();

    // 7. Update user model with denormalized data
    await User.findByIdAndUpdate(userId, {
      'gamification.currentLevel': userProgress.currentLevel,
      'gamification.totalPoints': userProgress.totalPoints,
      'gamification.achievementCount': await UserAchievement.countDocuments({ 
        userId, 
        isCompleted: true 
      })
    });

    // 8. Send notifications (no point notification since points are awarded manually by manager)
    await sendGamificationNotifications(userId, results, event);

    return { success: true, results };
  } catch (error) {
    console.error('Error processing event completion gamification:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Check and award automatic achievements based on user progress
 */
async function checkAndAwardAchievements(userId, userProgress, event) {
  const earnedAchievements = [];

  // Get all active automatic achievements
  const autoAchievements = await AchievementDefinition.find({
    isActive: true,
    'criteria.type': { $ne: 'manual' }
  }).lean();

  for (const achievement of autoAchievements) {
    let shouldAward = false;
    let progress = 0;

    switch (achievement.criteria.type) {
      case 'first_event':
        shouldAward = userProgress.stats.eventsCompleted === 1;
        progress = shouldAward ? 1 : 0;
        break;

      case 'events_completed':
        progress = userProgress.stats.eventsCompleted;
        shouldAward = progress >= achievement.criteria.threshold;
        break;

      case 'hours_volunteered':
        progress = userProgress.stats.hoursVolunteered;
        shouldAward = progress >= achievement.criteria.threshold;
        break;

      case 'consecutive_events':
        progress = userProgress.currentStreak;
        shouldAward = progress >= achievement.criteria.threshold;
        break;

      case 'events_in_category':
        if (achievement.criteria.categoryId) {
          const categoryStat = userProgress.stats.categoryStats.find(
            cs => cs.categoryId?.toString() === achievement.criteria.categoryId.toString()
          );
          progress = categoryStat?.eventsCompleted || 0;
          shouldAward = progress >= achievement.criteria.threshold;
        }
        break;

      case 'events_hosted':
        // This is checked separately when manager completes an event
        break;
    }

    if (shouldAward) {
      // Check if user already has this achievement
      const existing = await UserAchievement.findOne({ 
        userId, 
        achievementId: achievement._id, 
        isCompleted: true 
      });
      
      if (!existing) {
        // Award the achievement
        await UserAchievement.findOneAndUpdate(
          { userId, achievementId: achievement._id },
          {
            userId,
            achievementId: achievement._id,
            eventId: event._id,
            progress: achievement.criteria.threshold,
            isCompleted: true,
            completedAt: new Date()
          },
          { upsert: true, new: true }
        );

        // Award points for automatic achievements too
        if (achievement.pointsReward > 0) {
          userProgress.totalPoints += achievement.pointsReward;
          
          // Record point history
          await PointHistory.create({
            userId,
            points: achievement.pointsReward,
            type: 'achievement_earned',
            description: `Earned achievement: ${achievement.name}`,
            relatedAchievement: achievement._id,
            relatedEvent: event._id
          });
        }

        // Update user's achievement count
        await User.findByIdAndUpdate(userId, {
          $inc: { 'gamification.achievementCount': 1 }
        });

        earnedAchievements.push(achievement);
      }
    } else {
      // Update progress for in-progress achievements
      await UserAchievement.findOneAndUpdate(
        { userId, achievementId: achievement._id },
        {
          userId,
          achievementId: achievement._id,
          progress: Math.min(progress, achievement.criteria.threshold),
          isCompleted: false
        },
        { upsert: true }
      );
    }
  }

  return earnedAchievements;
}

/**
 * Process gamification for event host when event is completed
 */
export async function processEventHostCompletion(managerId, eventId) {
  try {
    const event = await Event.findById(eventId).lean();
    if (!event) return { success: false, error: 'Event not found' };

    // Get or create user progress
    let userProgress = await UserProgress.findOne({ userId: managerId });
    if (!userProgress) {
      userProgress = await UserProgress.create({ userId: managerId });
    }

    const results = {
      pointsEarned: 0,
      achievementsEarned: []
    };

    // Award points for hosting
    const hostPoints = 20; // Base points for hosting an event
    results.pointsEarned = hostPoints;

    // Update stats
    userProgress.stats.eventsHosted = (userProgress.stats.eventsHosted || 0) + 1;
    userProgress.totalPoints += hostPoints;

    // Check for host achievements
    const hostAchievements = await AchievementDefinition.find({
      isActive: true,
      'criteria.type': 'events_hosted'
    }).lean();

    for (const achievement of hostAchievements) {
      const existing = await UserAchievement.findOne({
        userId: managerId,
        achievementId: achievement._id,
        isCompleted: true
      });

      if (!existing && userProgress.stats.eventsHosted >= achievement.criteria.threshold) {
        await UserAchievement.create({
          userId: managerId,
          achievementId: achievement._id,
          eventId,
          progress: achievement.criteria.threshold,
          isCompleted: true,
          completedAt: new Date()
        });

        if (achievement.pointsReward > 0) {
          userProgress.totalPoints += achievement.pointsReward;
          results.pointsEarned += achievement.pointsReward;

          await PointHistory.create({
            userId: managerId,
            points: achievement.pointsReward,
            type: 'achievement_earned',
            description: `Earned achievement: ${achievement.name}`,
            relatedAchievement: achievement._id
          });
        }

        results.achievementsEarned.push(achievement);
      }
    }

    // Check for level up
    const newLevelInfo = await calculateLevel(userProgress.totalPoints);
    if (newLevelInfo.level > userProgress.currentLevel) {
      userProgress.currentLevel = newLevelInfo.level;
    }

    await userProgress.save();

    // Update user model
    await User.findByIdAndUpdate(managerId, {
      'gamification.currentLevel': userProgress.currentLevel,
      'gamification.totalPoints': userProgress.totalPoints,
      'gamification.achievementCount': await UserAchievement.countDocuments({
        userId: managerId,
        isCompleted: true
      })
    });

    // Record history
    await PointHistory.create({
      userId: managerId,
      points: hostPoints,
      type: 'event_hosted',
      description: `Hosted event: ${event.name}`,
      relatedEvent: eventId
    });

    return { success: true, results };
  } catch (error) {
    console.error('Error processing event host completion:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Calculate level based on total points
 */
async function calculateLevel(points) {
  const levels = await LevelDefinition.find({ isActive: true })
    .sort({ pointsRequired: -1 })
    .lean();

  for (const level of levels) {
    if (points >= level.pointsRequired) {
      return level;
    }
  }

  // Return default level 1 if no levels defined
  return { level: 1, name: 'Tân Binh', pointsRequired: 0 };
}

/**
 * Check if user meets event requirements
 */
export async function checkEventRequirements(userId, eventId) {
  try {
    const event = await Event.findById(eventId)
      .populate('requirements.requiredAchievements', 'name icon')
      .lean();

    if (!event) {
      return { eligible: false, error: 'Event not found' };
    }

    // If no requirements, user is eligible
    if (!event.requirements?.hasRequirements) {
      return { eligible: true, requirements: null };
    }

    const userProgress = await UserProgress.findOne({ userId }) || {
      totalPoints: 0,
      currentLevel: 1,
      stats: { eventsCompleted: 0 }
    };

    const checks = {
      level: {
        required: event.requirements.minLevel || 1,
        current: userProgress.currentLevel,
        passed: userProgress.currentLevel >= (event.requirements.minLevel || 1)
      },
      points: {
        required: event.requirements.minPoints || 0,
        current: userProgress.totalPoints,
        passed: userProgress.totalPoints >= (event.requirements.minPoints || 0)
      },
      eventsCompleted: {
        required: event.requirements.minEventsCompleted || 0,
        current: userProgress.stats?.eventsCompleted || 0,
        passed: (userProgress.stats?.eventsCompleted || 0) >= (event.requirements.minEventsCompleted || 0)
      }
    };

    // Check required achievements
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

    return {
      eligible: allPassed,
      requirements: {
        ...checks,
        achievements: achievementCheck,
        description: event.requirements.requirementDescription
      }
    };
  } catch (error) {
    console.error('Error checking event requirements:', error);
    return { eligible: false, error: error.message };
  }
}

/**
 * Send gamification-related notifications
 */
async function sendGamificationNotifications(userId, results, event) {
  try {
    const user = await User.findById(userId).select('username').lean();

    // Notification for points earned
    if (results.pointsEarned > 0) {
      await createAndSendNotification(
        {
          recipient: userId,
          sender: userId,
          type: 'points_earned',
          content: `🎉 Bạn đã nhận được ${results.pointsEarned} điểm từ sự kiện "${event.name}"!`,
          event: event._id
        },
        {
          title: 'Điểm thưởng!',
          body: `+${results.pointsEarned} điểm từ "${event.name}"`,
          icon: '🏆'
        }
      );
    }

    // Notification for achievements earned (with points info)
    for (const achievement of results.achievementsEarned) {
      const pointsText = achievement.pointsReward > 0 
        ? ` và nhận được ${achievement.pointsReward} điểm`
        : '';
      await createAndSendNotification(
        {
          recipient: userId,
          sender: userId,
          type: 'achievement_earned',
          content: `🏆 Chúc mừng! Bạn đã đạt được thành tích "${achievement.name}"${pointsText}!`
        },
        {
          title: 'Thành tích mới!',
          body: `${achievement.icon} ${achievement.name}${achievement.pointsReward > 0 ? ` (+${achievement.pointsReward} XP)` : ''}`,
          icon: achievement.icon
        }
      );
    }

    // Notification for level up
    if (results.leveledUp) {
      await createAndSendNotification(
        {
          recipient: userId,
          sender: userId,
          type: 'level_up',
          content: `🎊 Tuyệt vời! Bạn đã lên cấp ${results.newLevel} - ${results.newLevelInfo?.name || ''}!`
        },
        {
          title: 'Lên cấp!',
          body: `${results.newLevelInfo?.icon || '⭐'} Cấp ${results.newLevel}: ${results.newLevelInfo?.name || ''}`,
          icon: results.newLevelInfo?.icon || '⭐'
        }
      );
    }
  } catch (error) {
    console.error('Error sending gamification notifications:', error);
  }
}

/**
 * Award manual achievement from manager
 */
export async function awardManualAchievement(userId, achievementId, awardedBy, eventId = null, reason = '') {
  try {
    const achievement = await AchievementDefinition.findById(achievementId);
    if (!achievement) {
      return { success: false, error: 'Achievement not found' };
    }

    // Award the achievement (allow multiple times)
    const newAchievement = await UserAchievement.create({
      userId,
      achievementId,
      eventId,
      awardedBy,
      awardReason: reason,
      progress: achievement.criteria?.threshold || 1,
      isCompleted: true,
      completedAt: new Date(),
      timesAwarded: 1
    });

    // Award points from manual achievement and update user progress
    let userProgress = await UserProgress.findOne({ userId });
    if (!userProgress) {
      userProgress = await UserProgress.create({ userId });
    }

    const pointsEarned = achievement.pointsReward || 0;
    if (pointsEarned > 0) {
      userProgress.totalPoints += pointsEarned;

      // Check for level up
      const newLevelInfo = await calculateLevel(userProgress.totalPoints);
      if (newLevelInfo.level > userProgress.currentLevel) {
        userProgress.currentLevel = newLevelInfo.level;
      }

      await userProgress.save();

      // Record point history
      await PointHistory.create({
        userId,
        points: pointsEarned,
        type: 'achievement_earned',
        description: `Earned achievement: ${achievement.name}`,
        relatedAchievement: achievement._id,
        relatedEvent: eventId
      });
    }

    // Update user model with denormalized data
    await User.findByIdAndUpdate(userId, {
      'gamification.currentLevel': userProgress.currentLevel,
      'gamification.totalPoints': userProgress.totalPoints,
      $inc: { 'gamification.achievementCount': 1 }
    });

    // Send notification (include points if any)
    const notificationContent = pointsEarned > 0
      ? `🏆 Bạn đã được trao thành tích "${achievement.name}" và nhận ${pointsEarned} điểm!`
      : `🏆 Bạn đã được trao thành tích "${achievement.name}"!`;

    await createAndSendNotification(
      {
        recipient: userId,
        sender: awardedBy,
        type: 'achievement_earned',
        content: notificationContent,
        event: eventId
      },
      {
        title: 'Thành tích mới!',
        body: `${achievement.icon} ${achievement.name}${pointsEarned > 0 ? ` (+${pointsEarned} XP)` : ''}`,
        icon: achievement.icon
      }
    );

    return { success: true, achievement, pointsEarned };
  } catch (error) {
    console.error('Error awarding manual achievement:', error);
    return { success: false, error: error.message };
  }
}
