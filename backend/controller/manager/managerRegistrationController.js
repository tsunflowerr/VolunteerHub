import Registration from '../../models/registrationsModel.js';
import Notification from '../../models/notificationModel.js';
import Event from '../../models/eventModel.js';
import User from '../../models/userModel.js';
import {
  createAndSendNotification,
  generateNotificationContent,
} from '../../utils/notificationHelper.js';
import { processEventCompletion, awardManualAchievement } from '../../utils/gamificationHelper.js';
import redisClient from '../../config/redis.js';
import {
  invalidateCache,
  invalidateCacheByPattern,
} from '../../utils/cacheHelper.js';

export async function updateRegistrationStatus(req, res) {
  try {
    const { registrationId } = req.params;
    const { status } = req.body;

    if (!['confirmed', 'cancelled', 'completed'].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid status value' });
    }

    const registration = await Registration.findOne({
      _id: registrationId,
    }).populate('eventId');

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found',
      });
    }

    const event = registration.eventId;

    // Authorization check: Ensure the event belongs to the current manager
    if (event.managerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: This registration is not for your event',
      });
    }

    // Update registration status
    if (status === 'completed') {
      if (registration.status !== 'confirmed') {
        return res.status(400).json({
          success: false,
          message: `Cannot mark as completed. Volunteer must be confirmed first. Current: ${registration.status}`,
        });
      }
    } else if (registration.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot update registration that is already ${registration.status}`,
      });
    }

    // 🔹 Update registration
    
    // If approving (confirming) the registration, check capacity and increment count
    if (status === 'confirmed') {
        const currentEvent = await Event.findById(event._id);
        
        if (currentEvent.capacity && currentEvent.registrationsCount >= currentEvent.capacity) {
             return res.status(409).json({ 
                success: false, 
                message: "Event is already full" 
            });
        }
        
        await Event.findByIdAndUpdate(
            event._id,
            { $inc: { registrationsCount: 1 } }
        );
    }

    registration.status = status;
    registration.reviewedAt = new Date();
    await registration.save();

    // Process gamification rewards when marking as completed
    if (status === 'completed') {
      try {
        const gamificationResult = await processEventCompletion(
          registration.userId,
          event._id
        );
        if (gamificationResult.success) {
          console.log(`Gamification processed for user ${registration.userId}:`, gamificationResult.results);
        }
      } catch (gamificationError) {
        console.error('Error processing gamification:', gamificationError);
        // Don't fail the request if gamification fails
      }
    }

    // Invalidate event-related caches
    await invalidateCache(`event:detail:${event._id}`);
    await invalidateCacheByPattern('events:all:*');
    await invalidateCacheByPattern('events:trending:*');
    await invalidateCache('events:upcoming');
    await invalidateCacheByPattern('events:category:*');
    await invalidateCache(`dashboard:manager:${req.user._id}`); // Update manager dashboard stats

    // Use helper function to generate notification content
    const notificationContent = generateNotificationContent(
      'registration_status_update',
      status,
      req.user.username,
      event.name
    );

    const volunteerNotificationData = {
      recipient: registration.userId,
      sender: req.user._id,
      type: 'registration_status_update',
      relatedStatus: status,
      content: notificationContent.content,
      event: registration.eventId,
    };

    const volunteerPushPayload = {
      title: notificationContent.title,
      body: notificationContent.body,
      icon: req.user.avatar || '/default-avatar.png',
    };

    let shouldSendNotification = true;
    const cacheKey = `update_registration:${registration.userId}:${event._id}`;
    try {
      const isRecent = await redisClient.exists(cacheKey);
      if (isRecent) {
        shouldSendNotification = false;
      }
    } catch (error) {
      console.error('Error checking Redis cache:', error);
    }

    if (shouldSendNotification) {
      createAndSendNotification(
        volunteerNotificationData,
        volunteerPushPayload
      );
      try {
        await redisClient.setEx(cacheKey, 300, '1'); // Cache for 5 minutes
      } catch (error) {
        console.error('Error setting Redis cache:', error);
      }
    }

    res.status(200).json({ success: true, registration });
  } catch (error) {
    console.error('Error updating registration status:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function getVolunteersForEvent(req, res) {
  try {
    const { eventId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const event = await Event.findById(eventId).lean();
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: 'Event not found' });
    }

    // Authorization check removed to allow public/admin access to volunteer list
    // previously: if (event.managerId.toString() !== req.user._id.toString()) { ... }

    const [registrations, total] = await Promise.all([
      await Registration.find({
        eventId: eventId,
        status: { $in: ['confirmed', 'completed'] },
      })
        .populate('userId', 'username email avatar')
        .lean(),
      Registration.countDocuments({
        eventId: eventId,
        status: { $in: ['confirmed', 'completed'] },
      }),
    ]);

    const volunteers = registrations.map((reg) => ({
      _id: reg._id, // Registration ID
      userId: reg.userId._id, // User ID
      username: reg.userId.username,
      email: reg.userId.email,
      avatar: reg.userId.avatar,
      registrationStatus: reg.status,
      registeredAt: reg.createdAt,
    }));

    res.status(200).json({
      success: true,
      eventName: event.name,
      volunteers,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
        limit: Number(limit),
      },
    });
  } catch (error) {
    console.error('Error fetching volunteers for event:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function getRegistrationsByStatus(req, res) {
  try {
    const status = req.query.status;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    // Get all event IDs of this manager (use distinct to get IDs directly)
    const eventIds = await Event.find({ managerId: req.user._id }).distinct(
      '_id'
    );

    if (!eventIds || eventIds.length === 0) {
      return res.status(200).json({
        success: true,
        registrations: [],
        pagination: {
          total: 0,
          page: Number(page),
          pages: 0,
          limit: Number(limit),
        },
      });
    }

    const filter = { eventId: { $in: eventIds } };

    // Add status filter if provided
    if (status) {
      if (
        !['pending', 'confirmed', 'cancelled', 'completed'].includes(status)
      ) {
        return res
          .status(400)
          .json({ success: false, message: 'Invalid status value' });
      }
      filter.status = status;
    }

    const [registrations, total] = await Promise.all([
      Registration.find(filter)
        .populate(
          'eventId',
          'name category location capacity status startDate endDate registrationsCount'
        )
        .populate('userId', 'username email avatar gamification')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean(),
      Registration.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      registrations,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
        limit: Number(limit),
      },
    });
  } catch (error) {
    console.error('Error fetching registrations by status:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

/**
 * Get available achievements that manager can award (manual achievements)
 */
export async function getAvailableAchievements(req, res) {
  try {
    const { AchievementDefinition } = await import('../../models/achievementModel.js');
    
    // Get manual achievements that managers can award
    const achievements = await AchievementDefinition.find({
      isActive: true,
      'criteria.type': 'manual'
    })
      .sort({ displayOrder: 1 })
      .lean();

    res.status(200).json({
      success: true,
      data: achievements
    });
  } catch (error) {
    console.error('Error getting available achievements:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

/**
 * Award an achievement to a volunteer
 */
export async function awardAchievementToVolunteer(req, res) {
  try {
    const { achievementId, userId, reason, eventId } = req.body;
    const managerId = req.user._id;

    // Verify the event belongs to this manager (if eventId provided)
    if (eventId) {
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({ success: false, message: 'Event not found' });
      }
      if (event.managerId.toString() !== managerId.toString()) {
        return res.status(403).json({ 
          success: false, 
          message: 'You can only award achievements for your own events' 
        });
      }
    }

    // Use the gamification helper to award the achievement
    const result = await awardManualAchievement(userId, achievementId, managerId, eventId, reason);

    if (!result.success) {
      return res.status(400).json({ success: false, message: result.error });
    }

    // Invalidate user's gamification cache
    await invalidateCacheByPattern(`gamification:profile:${userId}`);
    await invalidateCacheByPattern(`user:${userId}`);

    res.status(200).json({
      success: true,
      message: `Achievement "${result.achievement.name}" awarded successfully`,
      data: result.achievement
    });
  } catch (error) {
    console.error('Error awarding achievement:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}
