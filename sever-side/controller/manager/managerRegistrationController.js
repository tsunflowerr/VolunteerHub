import Registration from "../../models/registrationsModel.js";
import Notification from "../../models/notificationModel.js";
import Event from "../../models/eventModel.js";
import User from "../../models/userModel.js"; 
import { createAndSendNotification } from '../../utils/notificationHelper.js';

export async function updateRegistrationStatus(req, res) {
    try {
        const { registrationId } = req.params;
        const { status } = req.body;
        if (!["confirmed", "cancelled", "completed"].includes(status)) {
             return res.status(400).json({ success: false, message: "Invalid status value" });
        }

        const registration = await Registration.findOneAndUpdate(
            { _id: registrationId, status: "pending" }, 
            { status: status, reviewedAt: new Date() },
            { new: true }
        );

        if (!registration) {
            return res.status(404).json({ 
                success: false, 
                message: "Registration not found or is not in pending state" 
            });
        }

        const event = await Event.findById(registration.eventId);
        if (!event) {
            return res.status(404).json({ success: false, message: "Event not found" });
        }

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

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ success: false, message: "Event not found" });
        }

        const registrations = await Registration.find({
            eventId: eventId,
            status: { $in: ["confirmed", "completed"] }
        }).populate('userId', 'name email avatar'); 

        const volunteers = registrations.map(reg => ({
            userId: reg.userId._id,
            name: reg.userId.name,
            email: reg.userId.email,
            avatar: reg.userId.avatar,
            registrationStatus: reg.status,
            registeredAt: reg.createdAt 
        }));

        res.status(200).json({ success: true, eventName: event.name, volunteers });
    } catch (error) {
        console.error("Error fetching volunteers for event:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

export async function getRegistrationsByStatus(req, res) {
    try {
        const  { status } = req.params;
        if (!["pending", "confirmed", "cancelled", "completed"].includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status value" });
        }

        const registrations = await Registration.find({ status: status }).populate('eventId', 'name category location capacity status startDate endDate registrationsCount').populate('userId', 'name email avatar');
        if(!registrations || registrations.length === 0) {
            return res.status(404).json({ success: false, message: "No registrations found for the specified status" });
        }
        res.status(200).json({ success: true, registrations });
    } catch (error) {
        console.error("Error fetching registrations by status:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
}