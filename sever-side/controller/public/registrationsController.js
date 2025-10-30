import Registration from "../../models/registrationsModel.js";
import Event from "../../models/eventModel.js";
import { createAndSendNotification } from '../../utils/notificationHelper.js';
import redisClient from '../../config/redis.js';
import mongoose from 'mongoose';
 
export async function registerEvent(req, res) {
    // 🔒 START TRANSACTION
    const session = await mongoose.startSession();
    session.startTransaction();
    
    const { eventId } = req.params; 
    const volunteerId = req.user._id;

    try {
        const event = await Event.findById(eventId).select('name managerId capacity').session(session);
        if (!event) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: "Event not found" });
        }

        const existingRegistration = await Registration.findOne({ userId: volunteerId, eventId }).session(session);
        if (existingRegistration) {
            await session.abortTransaction();
            return res.status(409).json({ success: false, message: "You have already registered for this event" });
        }
        
        const currentRegistrations = await Registration.countDocuments({ 
            eventId,
            status: { $in: ['pending', 'confirmed'] }  
        }).session(session);

        if (currentRegistrations >= event.capacity) {
            await session.abortTransaction();
            return res.status(409).json({ message: "Event capacity reached" });
        }
        
        // 🔹 Step 1: Create registration (với session)
        const newRegistration = new Registration({ userId: volunteerId, eventId });
        await newRegistration.save({ session });
        
        // 🔹 Step 2: Update event count (với session)
        await Event.findByIdAndUpdate(
            eventId, 
            { $inc: { registrationsCount: 1 } },
            { session }
        );
        
        // Prepare notification data
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

        // ✅ COMMIT trước khi send notification (vì notification không cần rollback)
        await session.commitTransaction();

        if (shouldSendNotification) {
            createAndSendNotification(volunteerNotificationData, volunteerPushPayload);
            if (event.managerId) {
                createAndSendNotification(managerNotificationData, managerPushPayload);
            }
            try {
                await redisClient.setEx(cacheKey, 300, '1');
            } catch (error) {
                console.error("Error setting Redis cache:", error);
            }
        }

        res.status(201).json({ success: true, message: "Event registered successfully" });
    } catch (error) {
        // ❌ ROLLBACK
        await session.abortTransaction();
        console.error("Error registering event:", error);
        res.status(500).json({ success: false, message: "Server error" });
    } finally {
        // 🔓 Đóng session
        session.endSession();
    }
}
export async function unregisterEvent(req, res) {
    // 🔒 START TRANSACTION
    const session = await mongoose.startSession();
    session.startTransaction();
    
    const {eventId} = req.params;
    const userId = req.user._id;
    const now = new Date();
    
    try {
        const event = await Event.findById(eventId).select('startDate').session(session);
        if(!event) {
            await session.abortTransaction();
            return res.status(404).json({success: false, message: "Event not found"})
        }
        if(now >= event.startDate) {
            await session.abortTransaction();
            return res.status(400).json({success: false, message: "Cannot unregister from an event that has already started"})
        }
        
        // 🔹 Step 1: Delete registration (với session)
        const deleted = await Registration.findOneAndDelete({userId, eventId}, { session });
        if(!deleted) {
            await session.abortTransaction();
            return res.status(404).json({success: false, message: "Registration not found"})
        }
        
        // 🔹 Step 2: Update event count (với session)
        await Event.findByIdAndUpdate(
            eventId,
            { $inc: { registrationsCount: -1 } },
            { session }
        );
        
        // ✅ COMMIT
        await session.commitTransaction();
        res.status(200).json({success: true, message: "Unregistered from event successfully"})
    } catch (error) {
        // ❌ ROLLBACK
        await session.abortTransaction();
        console.error("Error unregistering from event:", error);
        res.status(500).json({success: false, message: "Server error"});
    } finally {
        // 🔓 Đóng session
        session.endSession();
    }
}