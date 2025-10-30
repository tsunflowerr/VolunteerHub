import Registration from "../../models/registrationsModel.js";
import Notification from "../../models/notificationModel.js";
import Event from "../../models/eventModel.js";
import User from "../../models/userModel.js"; 
import { createAndSendNotification } from '../../utils/notificationHelper.js';

export async function updateRegistrationStatus(req, res) {
    try {
        const { registrationId } = req.params;
        const { status } = req.body; // Changed from params to body
        
        if (!["confirmed", "cancelled", "completed"].includes(status)) {
             return res.status(400).json({ success: false, message: "Invalid status value" });
        }

        const registration = await Registration.findOne({ _id: registrationId })
            .populate('eventId');

        if (!registration) {
            return res.status(404).json({ 
                success: false, 
                message: "Registration not found" 
            });
        }

        const event = registration.eventId;
        
        // Authorization check: Ensure the event belongs to the current manager
        if (event.managerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized: This registration is not for your event"
            });
        }

        // Update registration status
        if (registration.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: `Cannot update registration that is already ${registration.status}`
            });
        }

        registration.status = status;
        registration.reviewedAt = new Date();
        await registration.save();

        let content;
        if (status === "confirmed") {
            content = `Your registration for the event "${event.name}" has been confirmed.`;
        } else if (status === "cancelled") {
            content = `Your registration for the event "${event.name}" has been cancelled.`;
        } else if (status === "completed") {
            content = `Your registration for the event "${event.name}" has been completed.`;
        }

        const volunteerNotificationData = {
            recipient: registration.userId,
            sender: req.user._id,
            type:  status,
            content: content,
            event: registration.eventId,
        };

        let title, body;
        if (status === "confirmed") {
            title = 'Registration Confirmed! ✅';
            body = `Your registration for "${event.name}" has been confirmed.`;
        } else if (status === "cancelled") {
            title = 'Registration Cancelled ❌';
            body = `Your registration for "${event.name}" has been cancelled.`;
        } else if (status === "completed") {
            title = 'Registration Completed 🎉';
            body = `Your registration for "${event.name}" has been completed.`;
        }

        const volunteerPushPayload = {
            title: title,
            body: body,
            icon: req.user.avatar || '/default-avatar.png'
        };
        createAndSendNotification(volunteerNotificationData, volunteerPushPayload);

        res.status(200).json({ success: true, registration });
    } catch (error) {
        console.error("Error updating registration status:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

export async function getVolunteersForEvent(req, res) {
    try {
        const { eventId } = req.params;
        const {page = 1, limit = 10} = req.query;

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
        const status = req.query.status || req.params.status; // Support both query and param
        
        // Build filter for manager's events
        const managerEvents = await Event.find({ managerId: req.user._id }).select('_id');
        const eventIds = managerEvents.map(e => e._id);

        const filter = { eventId: { $in: eventIds } };
        
        // Add status filter if provided
        if (status) {
            if (!["pending", "confirmed", "cancelled", "completed"].includes(status)) {
                return res.status(400).json({ success: false, message: "Invalid status value" });
            }
            filter.status = status;
        }

        const registrations = await Registration.find(filter)
            .populate('eventId', 'name category location capacity status startDate endDate registrationsCount')
            .populate('userId', 'name email avatar')
            .sort({ createdAt: -1 });
            
        if(!registrations || registrations.length === 0) {
            return res.status(404).json({ success: false, message: "No registrations found for the specified status" });
        }
        res.status(200).json({ success: true, registrations });
    } catch (error) {
        console.error("Error fetching registrations by status:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
}