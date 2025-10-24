import Event from '../../models/eventModel.js';
import Category from '../../models/categoryModel.js';
import Registration from '../../models/registrationsModel.js';
import redisClient from '../../config/redis.js';
import User from '../../models/userModel.js';

export async function getAllEvents(req, res) {
    try {
        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [events, total] = await Promise.all([
            Event.find({status: { $in: ['approved', 'completed'] }})
                .populate('managerId', 'username email avatar')
                .populate('category', 'name slug')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Event.countDocuments({status: { $in: ['approved', 'completed'] }})
        ]);
        
        if(!events || events.length === 0) {
            return res.status(404).json({ success: false, message: "No events found" });
        }
        res.status(200).json({
            success: true, 
            events,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalEvents: total,
                limit
            }
        });
    }
    catch(err){
        console.error("Error fetching events:", err);
        res.status(500).json({success: false, message: "Server error" });
    }
}

export async function getEventById(req, res) {
    const eventId = req.params.id;
    const userId = req.user?._id || req.user?.id; // Get userId if authenticated
    const ipAddress = req.ip || req.connection.remoteAddress; // Get IP as fallback
    
    try {
        // Create unique view key using userId (if logged in) or IP address
        const viewerIdentifier = userId ? `user:${userId}` : `ip:${ipAddress}`;
        const viewCacheKey = `event:view:${eventId}:${viewerIdentifier}`;
        
        let shouldIncreaseView = true;
        
        // Check if this user/IP has viewed this event recently (within 1 hour)
        try {
            const hasViewed = await redisClient.get(viewCacheKey);
            if (hasViewed) {
                shouldIncreaseView = false;
            }
        } catch (redisError) {
            console.error("Error checking Redis view cache:", redisError);
            // Continue without Redis if it fails
        }
        
        // Fetch event and conditionally increase view count
        const event = await Event.findByIdAndUpdate(
            eventId, 
            shouldIncreaseView ? { $inc: { viewCount: 1 } } : {},
            { new: true }
        )
        .populate('managerId', 'username email avatar')
        .populate('category', 'name slug');
        
        if(!event) {
            return res.status(404).json({ success: false, message: "Event not found" });
        }
        
        // Set cache to prevent view count spam (expires in 1 hour = 3600 seconds)
        if (shouldIncreaseView) {
            try {
                await redisClient.setEx(viewCacheKey, 3600, '1');
            } catch (redisError) {
                console.error("Error setting Redis view cache:", redisError);
            }
        }
        
        res.status(200).json({success: true, event})
    }
    catch(err){
        console.error("Error fetching event by ID:", err);
        res.status(500).json({success: false, message: "Server error" });
    }
}

//Trending events based on registrations, likes, views, posts count, and age
export async function getTrendingEvents(req, res) {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const currentDate = new Date();
        
        // Get approved events that haven't ended yet
        const events = await Event.find({ 
            status: 'approved',
            endDate: { $gte: currentDate }
        }).populate('managerId', 'username email avatar').populate('category', 'name slug');
        
        if(!events || events.length === 0) {
            return res.status(404).json({ success: false, message: "No events found" });
        }
        
        // Calculate trending score for each event (using postsCount field directly - MUCH FASTER!)
        const eventsWithScore = events.map(event => {
            const daysSinceCreation = Math.max(1, (currentDate - event.createdAt) / (1000 * 60 * 60 * 24));
            
            // Trending score formula: (registrations * 4 + posts * 3 + likes * 2 + views) / age_factor
            // Higher weight for registrations, posts, and likes
            const ageFactor = Math.pow(daysSinceCreation + 2, 1.5); // Decay factor
            const trendingScore = (
                (event.registrationsCount || 0) * 4 + 
                (event.postsCount || 0) * 3 +
                (event.likesCount || 0) * 2 + 
                (event.viewCount || 0)
            ) / ageFactor;
            
            return {
                ...event.toObject(),
                trendingScore
            };
        });
        
        // Sort by trending score (highest first) and limit results
        const trendingEvents = eventsWithScore
            .sort((a, b) => b.trendingScore - a.trendingScore)
            .slice(0, limit);
        
        res.status(200).json({success: true, events: trendingEvents});
    }
    catch(err){
        console.error("Error fetching trending events:", err);
        res.status(500).json({success: false, message: "Server error" });
    }
}

export async function getEventsByCategorySlug(req, res) {
    const categoryslug = req.params.slug;
    try {
        const category = await Category.findOne({slug: categoryslug})
        if(!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }
        // category is an array in Event model, use $in
        const events = await Event.find({
            category: { $in: [category._id] },
            status: { $in: ['approved', 'completed'] }
        })
        .populate('managerId', 'username email avatar')
        .populate('category', 'name slug');
        
        if(!events || events.length === 0) {
            return res.status(404).json({ success: false, message: "No events found for this category" });
        }
        res.status(200).json({success: true, events});
    }
    catch(err){
        console.error("Error fetching events by category slug:", err);
        res.status(500).json({success: false, message: "Server error" });
    }
}

export async function getUpcommingEvents(req, res) {
    try {
        const currentDate = new Date();
        const events = await Event.find({
            status: "approved", 
            startDate: { $gt: currentDate } 
        })
        .populate('managerId', 'username email avatar')
        .populate('category', 'name slug')
        .sort({ startDate: 1 }); // Sort by nearest date first
        
        if(!events || events.length === 0) {
            return res.status(404).json({ success: false, message: "No upcoming events found" });
        }
        res.status(200).json({success: true, events});

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
        const registrations = await Registration.find({ userId, ...(status ? { status } : {}) })
            .populate({
                path: 'eventId',
                populate: [
                    { path: 'managerId', select: 'username email avatar' },
                    { path: 'category', select: 'name slug' }
                ]
            })
            .sort({ createdAt: -1 });
            
        if(!registrations || registrations.length === 0) {
            return res.status(200).json({success:true, message:"No events found", events: []});
        }
        
        // Return events with registration info
        const eventsWithRegistration = registrations.map(reg => ({
            ...reg.eventId.toObject(),
            registrationStatus: reg.status,
            registrationDate: reg.createdAt,
            registrationId: reg._id
        }));
        
        res.status(200).json({success:true, events: eventsWithRegistration});
    }
    catch(err) {
        console.error("Error fetching user events:", err);
        res.status(500).json({success: false, message: "Server error" });
    }
}

export async function addRemoveBookMark(req, res) {
    try {
        const userId = req.user.id || req.user._id;
        const eventId = req.params.eventId;
        
        if(!eventId) {
            return res.status(400).json({success:false, message:"EventId is required"})
        }
        
        // Check if event exists
        const event = await Event.findById(eventId);
        if(!event) {
            return res.status(404).json({success:false, message:"Event not found"})
        }
        
        const user = await User.findById(userId);
        if(!user) {
            return res.status(404).json({success:false, message:"User not found"})
        }
        
        const isBookmarked = user.bookmarks.some(b => b.toString() === eventId);
        if(isBookmarked) {
            user.bookmarks = user.bookmarks.filter(b => b.toString() !== eventId);
            await user.save();
            return res.status(200).json({success:true, type:"Remove", message:"Removed bookmark successfully"})
        }
        else {
            user.bookmarks.push(eventId);
            await user.save();
            return res.status(200).json({success:true, type:"Add", message:"Added bookmark successfully"})
        }
    }
    catch(error) {
        console.log('Error adding bookmark:', error);
        res.status(500).json({success: false, message: 'Server error'});
    }
}

export async function getUserBookMarks(req, res) {
    try {
        const userId = req.user._id || req.user.id;
        const user = await User.findById(userId)
        .select('bookmarks')
        .populate({
            path: 'bookmarks',
            select: "name description managerId category location thumbnail images capacity status startDate endDate likesCount viewCount registrationsCount createdAt",
            populate: [
                { path: 'managerId', select: 'username email avatar' },
                { path: 'category', select: 'name slug' }
            ]
        });
        if(!user) {
            return res.status(404).json({success:false, message:"User not found"})
        }
        res.status(200).json({success:true, bookmarks: user.bookmarks});
    }
    catch(error) {
        console.log('Error fetching user bookmarks:', error);
        res.status(500).json({success: false, message: 'Server error'});
    }
}
