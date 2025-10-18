import Registration from "../models/registrationsModel";
import Event from "../models/eventModel.js";
export async function registerEvent(req, res) {
    const {userId, eventId} = req.body;
    try {
        const newRegistration = new Registration({userId, eventId});
        await newRegistration.save();
        res.status(201).json({success: true, message: "Event registered successfully"});
    } catch (error) {
        console.error("Error registering event:", error);
        res.status(500).json({success: false, message: "Server error"});
    }
}

export async function unregisterEvent(req, res) {
    const {userId, eventId} = req.body;
    const now = new Date()
    try {
        const event =  await Event.findById(eventId).select('startTime');
        if(!event) {
            return res.status(404).json({success: false, message: "Event not found"})
        }
        if(now >= event.startTime) {
            return res.status(400).json({success: false, message: "Cannot unregister from an event that has already started"})
        }
        const  deleted = await Registration.findOneAndDelete({userId, eventId});
        if(!deleted) {
            return res.status(404).json({success: false, message: "Registration not found"})
        }
        res.status(200).json({success: true, message: "Unregistered from event successfully"})
    } catch (error) {
        console.error("Error unregistering from event:", error);
        res.status(500).json({success: false, message: "Server error"});
    }
}