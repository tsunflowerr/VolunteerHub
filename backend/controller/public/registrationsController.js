import Registration from "../../models/registrationsModel.js";
import Event from "../../models/eventModel.js";
import { createAndSendNotification, generateNotificationContent, generateNewRegistrationContent } from '../../utils/notificationHelper.js';
import { checkEventRequirements } from '../../utils/gamificationHelper.js';
import redisClient from '../../config/redis.js';
import mongoose from 'mongoose';
import { invalidateCache, invalidateCacheByPattern, invalidateEventCaches } from '../../utils/cacheHelper.js';

const NOTIFICATION_CACHE_TTL = 300;

export async function registerEvent(req, res) {
    try {
        const { eventId } = req.params; 
        const volunteerId = req.user._id;

        const event = await Event.findById(eventId)
            .select('name managerId capacity status startDate registrationsCount requirements')
            .populate('requirements.requiredAchievements', 'name icon');
        
        if (!event) {
            return res.status(404).json({ success: false, message: "Event not found" });
        }

        if (event.status !== 'approved') {
            return res.status(400).json({ 
                success: false, 
                message: `Cannot register for event with status: ${event.status}` 
            });
        }

        if (new Date() >= event.startDate) {
            return res.status(400).json({ 
                success: false, 
                message: "Cannot register for an event that has already started" 
            });
        }

        // Check event requirements if they exist
        if (event.requirements?.hasRequirements) {
            const eligibility = await checkEventRequirements(volunteerId, eventId);
            if (!eligibility.eligible) {
                return res.status(403).json({
                    success: false,
                    message: "You do not meet the requirements for this event",
                    requirements: eligibility.requirements
                });
            }
        }
        
        const existingRegistration = await Registration.findOne({ 
            userId: volunteerId, 
            eventId 
        });
        
        if (existingRegistration) {
            return res.status(409).json({ 
                success: false, 
                message: "You have already registered for this event" 
            });
        }
        
        // Removed registrationsCount increment and capacity check logic from here
        // Count should only increase when manager approves
        
        const newRegistration = new Registration({ userId: volunteerId, eventId });
        await newRegistration.save();

        // Invalidate all event-related caches
        await invalidateEventCaches(eventId, event.managerId);
        
        // Generate notification content for volunteer (registration confirmation)
        const volunteerContent = generateNotificationContent(
            'registration_status_update',
            'pending',
            req.user.username,
            event.name
        );
        
        const volunteerNotificationData = {
            recipient: volunteerId,
            sender: event.managerId || volunteerId,
            type: 'registration_status_update',
            relatedStatus: 'pending',
            content: volunteerContent.content,
            event: eventId,
        };
        
        const volunteerPushPayload = {
            title: volunteerContent.title,
            body: volunteerContent.body,
            icon: req.user.avatar || '/default-avatar.png'
        };
        
        // Generate notification content for manager (new registration)
        const managerContent = generateNewRegistrationContent(req.user.username, event.name);
        
        const managerNotificationData = {
            recipient: event.managerId,
            sender: volunteerId,
            type: 'registration_status_update',
            relatedStatus: 'pending',
            content: managerContent.content,
            event: eventId,
        };
        
        const managerPushPayload = {
            title: managerContent.title,
            body: managerContent.body,
            icon: req.user.avatar || '/default-avatar.png'
        };
        
        let shouldSendNotification = true;
        const cacheKey = `registration:${volunteerId}:${eventId}`;
        try {
            const isRecent = await redisClient.exists(cacheKey);
            if(isRecent) {
                shouldSendNotification = false;
            }
        }
        catch(error) {
            console.error("Error checking Redis cache:", error);
        }

        if (shouldSendNotification) {
            createAndSendNotification(volunteerNotificationData, volunteerPushPayload);
            if (event.managerId) {
                createAndSendNotification(managerNotificationData, managerPushPayload);
            }
            try {
                await redisClient.setEx(cacheKey, NOTIFICATION_CACHE_TTL, '1');
            } catch (error) {
                console.error("Error setting Redis cache:", error);
            }
        }

        res.status(201).json({ 
            success: true, 
            message: "Event registered successfully",
            data: {
                registrationId: newRegistration._id,
                eventName: event.name,
                status: newRegistration.status
            }
        });
    } catch (error) {
        console.error("Error registering event:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
}
export async function unregisterEvent(req, res) {
    try {
        const { eventId } = req.params;
        const userId = req.user._id;
        const now = new Date();
        
        const event = await Event.findById(eventId).select('name startDate');
        if (!event) {
            return res.status(404).json({ success: false, message: "Event not found" });
        }
        
        if (now >= event.startDate) {
            return res.status(400).json({ 
                success: false, 
                message: "Cannot unregister from an event that has already started" 
            });
        }
        
        const registration = await Registration.findOne({ userId, eventId });
        if (!registration) {
            return res.status(404).json({ success: false, message: "Registration not found" });
        }

        if (registration.status === 'completed') {
            return res.status(400).json({ 
                success: false, 
                message: "Cannot unregister from a completed event" 
            });
        }
        
        // Only decrease count if the registration was confirmed/approved or completed
        if (['confirmed', 'completed'].includes(registration.status)) {
            await Event.findByIdAndUpdate(
                eventId,
                { $inc: { registrationsCount: -1 } }
            );
        }
        
        await Registration.findByIdAndDelete(registration._id);

        // Invalidate all event-related caches
        const eventFull = await Event.findById(eventId).select('managerId');
        await invalidateEventCaches(eventId, eventFull?.managerId);
        
        res.status(200).json({ 
            success: true, 
            message: "Unregistered from event successfully",
            data: { eventName: event.name }
        });
    } catch (error) {
        console.error("Error unregistering from event:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

export async function getMyRegistrations(req, res) {
    try {
        const userId = req.user._id;
        const status = req.query.status;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const query = { userId };
        if (status) {
            query.status = status;
        }

        const skip = (page - 1) * limit;
        
        const [registrations, total] = await Promise.all([
            Registration.find(query)
                .populate({
                    path: 'eventId',
                    select: 'name description location startDate endDate thumbnail capacity status managerId categories',
                    populate: [
                        { path: 'managerId', select: 'username email avatar' },
                        { path: 'categories', select: 'name slug color description' }
                    ]
                })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            Registration.countDocuments(query)
        ]);

        res.status(200).json({
            success: true,
            data: registrations,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        });
    } catch (error) {
        console.error("Error getting registrations:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

export async function getRegistrationDetail(req, res) {
    try {
        const { registrationId } = req.params;
        const userId = req.user._id;
        
        const registration = await Registration.findOne({ 
            _id: registrationId, 
            userId 
        })
        .populate({
            path: 'eventId',
            select: 'name description location startDate endDate thumbnail capacity status managerId categories',
            populate: [
                { path: 'managerId', select: 'username email avatar' },
                { path: 'categories', select: 'name slug color description' }
            ]
        })
        .lean();

        if (!registration) {
            return res.status(404).json({ success: false, message: "Registration not found" });
        }

        res.status(200).json({
            success: true,
            data: registration
        });
    } catch (error) {
        console.error("Error getting registration detail:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

export async function getUserRegistrations(req, res) {
    try {
        const { userId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Only show completed registrations publicly
        const query = { userId, status: 'completed' };

        const [registrations, total] = await Promise.all([
            Registration.find(query)
                .populate({
                    path: 'eventId',
                    select: 'name description location startDate endDate thumbnail capacity status managerId categories',
                    populate: [
                        { path: 'managerId', select: 'username email avatar' },
                        { path: 'categories', select: 'name slug color description' }
                    ]
                })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Registration.countDocuments(query)
        ]);

        res.status(200).json({
            success: true,
            data: registrations,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                limit
            }
        });
    } catch (error) {
        console.error("Error getting user registrations:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
}