import Registration from "../../models/registrationsModel.js";
import Notification from "../../models/notificationModel.js";
import Event from "../../models/eventModel.js";
import User from "../../models/userModel.js"; 
import { createAndSendNotification, generateNotificationContent } from '../../utils/notificationHelper.js';
import redisClient from '../../config/redis.js';
import mongoose from 'mongoose';

export async function updateRegistrationStatus(req, res) {
    // 🔒 START TRANSACTION
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const { registrationId } = req.params;
        const { status } = req.body;
        
        if (!["confirmed", "cancelled", "completed"].includes(status)) {
             return res.status(400).json({ success: false, message: "Invalid status value" });
        }

        const registration = await Registration.findOne({ _id: registrationId })
            .populate('eventId')
            .session(session);

        if (!registration) {
            await session.abortTransaction();
            return res.status(404).json({ 
                success: false, 
                message: "Registration not found" 
            });
        }

        const event = registration.eventId;
        
        // Authorization check: Ensure the event belongs to the current manager
        if (event.managerId.toString() !== req.user._id.toString()) {
            await session.abortTransaction();
            return res.status(403).json({
                success: false,
                message: "Unauthorized: This registration is not for your event"
            });
        }

        // Update registration status
        if (registration.status !== "pending") {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: `Cannot update registration that is already ${registration.status}`
            });
        }

        // 🔹 Update registration (với session)
        registration.status = status;
        registration.reviewedAt = new Date();
        await registration.save({ session });

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
            icon: req.user.avatar || '/default-avatar.png'
        };

        let shouldSendNotification = true;
        const cacheKey = `update_registration:${registration.userId}:${event._id}`;
        try {
            const isRecent = await redisClient.exists(cacheKey);
            if(isRecent) {
                shouldSendNotification = false;
            }
        } catch (error) {
            console.error("Error checking Redis cache:", error);
        }

        // ✅ COMMIT trước khi send notification
        await session.commitTransaction();

        if (shouldSendNotification) {
            createAndSendNotification(volunteerNotificationData, volunteerPushPayload);
            try {
                await redisClient.setEx(cacheKey, 300, '1'); // Cache for 5 minutes
            } catch (error) {
                console.error("Error setting Redis cache:", error);
            }
        }

        res.status(200).json({ success: true, registration });
    } catch (error) {
        // ❌ ROLLBACK
        await session.abortTransaction();
        console.error("Error updating registration status:", error);
        res.status(500).json({ success: false, message: "Server error" });
    } finally {
        // 🔓 Đóng session
        session.endSession();
    }
}

export async function getVolunteersForEvent(req, res) {
    try {
        const { eventId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const event = await Event.findById(eventId).lean();
        if (!event) {
            return res.status(404).json({ success: false, message: "Event not found" });
        }

        // Authorization check: Ensure the event belongs to the current manager
        if (event.managerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized: You can only view volunteers for your own events"
            });
        }

        const [registrations, total] = await Promise.all([
            await Registration.find({
                eventId: eventId,
                status: { $in: ["confirmed", "completed"] }
            }).populate('userId', 'name email avatar').lean(),
            Registration.countDocuments({
                eventId: eventId,
                status: { $in: ["confirmed", "completed"] }
            })
        ]);

        const volunteers = registrations.map(reg => ({
            userId: reg.userId._id,
            name: reg.userId.name,
            email: reg.userId.email,
            avatar: reg.userId.avatar,
            registrationStatus: reg.status,
            registeredAt: reg.createdAt 
        }));

       res.status(200).json({ success: true, eventName: event.name, volunteers,
            pagination: {
                total,
                page: Number(page),
                pages: Math.ceil(total / limit),
                limit: Number(limit)
            }
        });
    } catch (error) {
        console.error("Error fetching volunteers for event:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

export async function getRegistrationsByStatus(req, res) {
    try {
        const status = req.query.status;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        
        // Get all event IDs of this manager (use distinct to get IDs directly)
        const eventIds = await Event.find({ managerId: req.user._id }).distinct('_id');
        
        if (!eventIds || eventIds.length === 0) {
            return res.status(200).json({ 
                success: true, 
                registrations: [],
                pagination: {
                    total: 0,
                    page: Number(page),
                    pages: 0,
                    limit: Number(limit)
                }
            });
        }

        const filter = { eventId: { $in: eventIds } };
        
        // Add status filter if provided
        if (status) {
            if (!["pending", "confirmed", "cancelled", "completed"].includes(status)) {
                return res.status(400).json({ success: false, message: "Invalid status value" });
            }
            filter.status = status;
        }

        const [registrations, total] = await Promise.all([
            Registration.find(filter)
                .populate('eventId', 'name category location capacity status startDate endDate registrationsCount')
                .populate('userId', 'username email avatar')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(Number(limit))
                .lean(),
            Registration.countDocuments(filter)
        ]);
        
        res.status(200).json({ 
            success: true, 
            registrations,
            pagination: {
                total,
                page: Number(page),
                pages: Math.ceil(total / limit),
                limit: Number(limit)
            }
        });
    } catch (error) {
        console.error("Error fetching registrations by status:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
}