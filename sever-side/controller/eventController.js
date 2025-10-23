import Event from '../models/eventModel.js';
import Category from '../models/categoryModel.js';
import Registration from '../models/registrationsModel.js';
import Notification from '../models/notificationModel.js';
import redisClient from '../config/redis.js';
import { createAndSendNotification } from '../utils/notificationHelper.js';

export async function getAllEvents(req, res) {
    try {
        const events = await Event.find().populate('managerId', 'username email avatar').populate('category', 'name slug');
        if(!events) {
            return res.status(404).json({ message: "No events found" });
        }
        res.status(201).json({success: true, events})
    }
    catch(err){
        console.error("Error fetching events:", err);
        res.status(500).json({success: false, message: "Server error" });
    }
}

export async function getEventById(req, res) {
    const eventId = req.params.id;
    try {
        const event = await Event.findById(eventId).populate('managerId', 'username email avatar').populate('category', 'name slug');
        if(!event) {
            return res.status(404).json({ message: "Event not found" });
        }
        res.status(201).json({success: true, event})
    }
    catch(err){
        console.error("Error fetching event by ID:", err);
        res.status(500).json({success: false, message: "Server error" });
    }
}

export async function getEventsByCategorySlug(req, res) {
    const categoryslug = req.params.slug;
    try {
        const categoryId = await Category.findOne({slug: categoryslug})
        if(!categoryId) {
            return res.status(404).json({ message: "Category not found" });
        }
        const events = await Event.find({category: categoryId._id}).populate('managerId', 'username email avatar').populate('category', 'name slug');
        if(!events) {
            return res.status(404).json({ message: "No events found for this category" });
        }
        res.status(201).json({success: true, events});
    }
    catch(err){
        console.error("Error fetching events by category slug:", err);
        res.status(500).json({success: false, message: "Server error" });
    }
}

export async function getEventsByManager(req, res) {
    const managerId = req.params.managerId;
    try {
        const events = await Event.find({managerId}).populate('managerId', 'username email avatar').populate('category', 'name slug');
        if(!events) {
            return res.status(404).json({ message: "No events found for this manager" });
        }
        res.status(201).json({success: true, events});
    }
    catch(err){
        console.error("Error fetching events by manager ID:", err);
        res.status(500).json({success: false, message: "Server error" });
    }   
}

export async function getUpcommingEvents(req, res) {
    try {
        const currentDate = new Date();
        const events = await Event.find({ startDate: { $gt: currentDate } }).populate('managerId', 'username email avatar').populate('category', 'name slug');
        if(!events) {
            return res.status(404).json({ message: "No upcoming events found" });
        }
        res.status(201).json({success: true, events});

    }
    catch(err) {
        console.error("Error fetching upcoming events:", err);
        res.status(500).json({success: false, message: "Server error" });
    }
}

export async function getUserEvents(req, res) {
    const userId = req.user._id;
    const {status} = req.query; // expected values: "pending", "confirmed", "completed", "cancelled"
    try {
        const events = await Registration.find({ userId, ...(status ? { status } : {}) });
        if(events.length === 0) {
            return res.status(200).json({success:true, message:"No events found", events: []});
        }
        const eventIds = events.map(req => req.eventId)
        const userEvents = await Event.find({ _id: { $in: eventIds } })
            .populate('managerId', 'username email avatar')
            .populate('category', 'name slug');
        res.status(200).json({success:true, events: userEvents});
    }
    catch(err) {
        console.error("Error fetching user events:", err);
        res.status(500).json({success: false, message: "Server error" });
    }
}
//Manager Event Controller functions
export async function createEvent(req, res) {
    const { name, description, category, location, thumbnail, images, capacity, startDate, endDate } = req.body;
    const organizerId = req.user._id;
    try {
        if (!name || !description || !location || !capacity || !startDate || !endDate) {
            return res.status(400).json({success: false, message: "Missing required fields"});
        }
        const newEvent = new Event({
            name,
            description,
            managerId: organizerId,
            category,
            location,
            thumbnail,
            images,
            capacity,
            startDate,
            endDate
        })
        let saved = await newEvent.save();
        saved = await saved.populate('managerId', 'username email avatar');
        saved = await saved.populate('category', 'name slug');
        res.status(201).json({success: true, event: saved});
    } catch (error) {
        console.error("Error creating event:", error);
        res.status(500).json({success: false, message: "Failed to create event"});
    }
}

export async function updateEvent(req, res) {
    const eventId = req.params.id;
    const data = {...req.body, updatedAt: Date.now()};
    try {
        const updatedEvent = await Event.findByIdAndUpdate(eventId, data, {new: true, runValidators: true});
        if (!updatedEvent) {
            return res.status(404).json({success: false, message: "Event not found"});
        }
        res.status(200).json({success: true, event: updatedEvent});
    } catch (error) {
        console.error("Error updating event:", error);
        res.status(500).json({success: false, message: "Failed to update event"});
    }
}

export async function deleteEvent(req, res) {
    const eventId = req.params.id 
    try {
        const deletedEvent = await Event.findByIdAndDelete(eventId);
        if (!deletedEvent) {
            return res.status(404).json({success: false, message: "Event not found"});
        }
        res.status(200).json({success: true, message: "Event deleted successfully"});
    } catch (error) {
        console.error("Error deleting event:", error);
        res.status(500).json({success: false, message: "Failed to delete event"});
    }
}

//Admin event controller functions

export async function getPendingEvents(req, res) {
    try{
        const events = await Event.find({status: 'pending'}).populate('managerId', 'username email avatar').populate('category', 'name slug');
        if(!events || events.length === 0) {
            return res.status(404).json({ message: "No pending events found" });
        }
        res.status(200).json({ success: true, events });
    } catch (error) {
        console.error("Error fetching pending events:", error);
        res.status(500).json({ success: false, message: "Failed to fetch pending events" });
    }
}

export async function updateStatusEvent(req, res) { 
    const eventId = req.params.id;
    const { status } = req.body; // expected values: "approved", "rejected"
    try {
        if (!['approved', 'rejected', 'cancelled'].includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status value" });
        }
        const updatedEvent = await Event.findByIdAndUpdate(eventId, { status }, { new: true });
        if (!updatedEvent) {
            return res.status(404).json({ success: false, message: "Event not found" });
        }
        const notificationData = {
            recipient: updatedEvent.managerId,
            sender: req.user._id,
            type: status,
            content: `Your event "${updatedEvent.name}" has been ${status}.`,
            event: eventId,
        };
        const adminPushPayload = {
            title: `Event ${status.charAt(0).toUpperCase() + status.slice(1)}!`,
            body: `Your event "${updatedEvent.name}" has been ${status}.`,
            icon: req.user.avatar || '/default-avatar.png'
        };
        const cacheKey = `event:${eventId}:${status}`;
        let shouldSendNotification = true;
        try {
            const isRecent = await redisClient.get(cacheKey);
            if (isRecent) {
                shouldSendNotification = false;
            }
        } catch (error) {
            console.error("Error checking Redis cache:", error);
        }

        if(shouldSendNotification) {
            createAndSendNotification(notificationData, adminPushPayload);
            try {
                await redisClient.setEx(cacheKey, 300, '1');
            }
            catch(redisError) {
                console.error("Error setting Redis cache:", redisError);
            }
        }
        res.status(200).json({ success: true, event: updatedEvent });
    } catch (error) {
        console.error("Error updating event status:", error);
        res.status(500).json({ success: false, message: "Failed to update event status" });
    }
}

