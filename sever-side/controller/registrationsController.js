import Registration from "../models/registrationsModel.js";
import Event from "../models/eventModel.js";
import { createAndSendNotification } from '../utils/notificationHelper.js';

export async function registerEvent(req, res) {
    const { eventId } = req.params; 
    const volunteerId = req.user._id;

    try {
        const event = await Event.findById(eventId).select('name managerId capacity');
        if (!event) {
            return res.status(404).json({ success: false, message: "Event not found" });
        }

        const existingRegistration = await Registration.findOne({ userId: volunteerId, eventId });
        if (existingRegistration) {
            return res.status(409).json({ success: false, message: "You have already registered for this event" });
        }
        const currentRegistrations = await Registration.countDocuments({ 
            eventId,
            status: { $in: ['pending', 'confirmed'] }  
        });

        if (currentRegistrations >= event.capacity) {
            return res.status(409).json({ message: "Event capacity reached" });
        }
        const newRegistration = new Registration({ userId: volunteerId, eventId });
        await newRegistration.save();

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
        createAndSendNotification(volunteerNotificationData, volunteerPushPayload);

        if (event.managerId) {
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
            createAndSendNotification(managerNotificationData, managerPushPayload);
        }

        res.status(201).json({ success: true, message: "Event registered successfully" });
    } catch (error) {
        console.error("Error registering event:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
}
export async function unregisterEvent(req, res) {
    const {eventId} = req.params;
    const userId = req.user._id;
    const now = new Date()
    try {
        const event =  await Event.findById(eventId).select('startDate');
        if(!event) {
            return res.status(404).json({success: false, message: "Event not found"})
        }
        if(now >= event.startDate) {
            return res.status(400).json({success: false, message: "Cannot unregister from an event that has already started"})
        }
        const deleted = await Registration.findOneAndDelete({userId, eventId});
        if(!deleted) {
            return res.status(404).json({success: false, message: "Registration not found"})
        }
        res.status(200).json({success: true, message: "Unregistered from event successfully"})
    } catch (error) {
        console.error("Error unregistering from event:", error);
        res.status(500).json({success: false, message: "Server error"});
    }
}