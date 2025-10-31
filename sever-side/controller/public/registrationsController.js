import Registration from "../../models/registrationsModel.js";
import Event from "../../models/eventModel.js";
import { createAndSendNotification } from '../../utils/notificationHelper.js';
import redisClient from '../../config/redis.js';
import mongoose from 'mongoose';

const NOTIFICATION_CACHE_TTL = 300;

export async function registerEvent(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    const { eventId } = req.params; 
    const volunteerId = req.user._id;

    try {
        const event = await Event.findById(eventId)
            .select('name managerId capacity status startDate registrationsCount')
            .session(session);
        
        if (!event) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: "Event not found" });
        }

        if (event.status !== 'approved') {
            await session.abortTransaction();
            return res.status(400).json({ 
                success: false, 
                message: `Cannot register for event with status: ${event.status}` 
            });
        }

        if (new Date() >= event.startDate) {
            await session.abortTransaction();
            return res.status(400).json({ 
                success: false, 
                message: "Cannot register for an event that has already started" 
            });
        }
        const existingRegistration = await Registration.findOne({ 
            userId: volunteerId, 
            eventId 
        }).session(session);
        
        if (existingRegistration) {
            await session.abortTransaction();
            return res.status(409).json({ 
                success: false, 
                message: "You have already registered for this event" 
            });
        }
        
        const updatedEvent = await Event.findOneAndUpdate(
            {
                _id: eventId,
                $expr: { $lt: ['$registrationsCount', '$capacity'] }
            },
            { $inc: { registrationsCount: 1 } },
            { session, new: true }
        );

        if (!updatedEvent) {
            await session.abortTransaction();
            return res.status(409).json({ 
                success: false, 
                message: "Event capacity reached" 
            });
        }
        
        const newRegistration = new Registration({ userId: volunteerId, eventId });
        await newRegistration.save({ session });
        
        const volunteerNotificationData = {
            recipient: volunteerId,
            sender: event.managerId || volunteerId,
            type: 'registration_confirmation',
            content: `You have successfully registered for the event "${event.name}". Current status: Pending approval.`,
            event: eventId,
        };
        const volunteerPushPayload = {
            title: 'Registration successful! ✅',
            body: `You have just registered for the event "${event.name}".`,
            icon:  req.user.avatar || '/default-avatar.png'
        };
        const managerNotificationData = {
            recipient: event.managerId,
            sender: volunteerId,
            type: 'new_registration',
            content: `${req.user.username} has just registered for the event "${event.name}" that you manage.`,
            event: eventId,
        };
        const managerPushPayload = {
            title: 'New volunteer registered! 🧑‍🤝‍🧑',
            body: `${req.user.username} just registered for your event.`,
            icon:  req.user.avatar || '/default-avatar.png'
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

        await session.commitTransaction();

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
        await session.abortTransaction();
        console.error("Error registering event:", error);
        res.status(500).json({ success: false, message: "Server error" });
    } finally {
        session.endSession();
    }
}
export async function unregisterEvent(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    const { eventId } = req.params;
    const userId = req.user._id;
    const now = new Date();
    
    try {
        const event = await Event.findById(eventId).select('name startDate').session(session);
        if (!event) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: "Event not found" });
        }
        
        if (now >= event.startDate) {
            await session.abortTransaction();
            return res.status(400).json({ 
                success: false, 
                message: "Cannot unregister from an event that has already started" 
            });
        }
        
        const registration = await Registration.findOne({ userId, eventId }).session(session);
        if (!registration) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: "Registration not found" });
        }

        if (registration.status === 'completed') {
            await session.abortTransaction();
            return res.status(400).json({ 
                success: false, 
                message: "Cannot unregister from a completed event" 
            });
        }
        
        await Registration.findByIdAndDelete(registration._id, { session });
        
        await Event.findByIdAndUpdate(
            eventId,
            { $inc: { registrationsCount: -1 } },
            { session }
        );
        
        await session.commitTransaction();
        res.status(200).json({ 
            success: true, 
            message: "Unregistered from event successfully",
            data: { eventName: event.name }
        });
    } catch (error) {
        await session.abortTransaction();
        console.error("Error unregistering from event:", error);
        res.status(500).json({ success: false, message: "Server error" });
    } finally {
        session.endSession();
    }
}

export async function getMyRegistrations(req, res) {
    try {
        const userId = req.user._id;
        const { status, page = 1, limit = 10 } = req.query;

        const query = { userId };
        if (status) {
            query.status = status;
        }

        const skip = (page - 1) * limit;
        
        const [registrations, total] = await Promise.all([
            Registration.find(query)
                .populate('eventId', 'name description location startDate endDate thumbnail capacity status')
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
        .populate('eventId', 'name description location startDate endDate thumbnail capacity status managerId')
        .populate('eventId.managerId', 'username email avatar')
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