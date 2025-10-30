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
                .limit(limit)
                .lean(),
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
            const hasViewed = await redisClient.exists(viewCacheKey);
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
        const { page = 1, limit = 10 } = req.query;
        
        const skip = (page - 1) * limit;
        
        const currentDate = new Date();
        
        const results = await Event.aggregate([
            {
                $match: {
                    status: 'approved',
                    endDate: { $gte: currentDate }
                }
            },
            {
                $addFields: {
                    daysSinceCreation: {
                        $divide: [
                            { $subtract: [currentDate, '$createdAt'] },
                            86400000 
                        ]
                    }
                }
            },
            {
                $addFields: {
                    ageFactor: {
                        $pow: [
                            { $add: ['$daysSinceCreation', 2] },
                            1.5
                        ]
                    }
                }
            },
            {
                $addFields: {
                    trendingScore: {
                        $divide: [
                            {
                                $add: [
                                    { $multiply: [{ $ifNull: ['$registrationsCount', 0] }, 4] },
                                    { $multiply: [{ $ifNull: ['$postsCount', 0] }, 3] },
                                    { $multiply: [{ $ifNull: ['$likesCount', 0] }, 2] },
                                    { $ifNull: ['$viewCount', 0] }
                                ]
                            },
                            '$ageFactor'
                        ]
                    }
                }
            },
            
            { $sort: { trendingScore: -1 } },
            
            {
                $facet: {
                    // Pipeline con 1: Lấy data của trang hiện tại
                    data: [
                        { $skip: skip },
                        
                        { $limit: limit },
                        
                        {
                            $lookup: {
                                from: 'users',
                                localField: 'managerId',
                                foreignField: '_id',
                                as: 'managerData'
                            }
                        },
                        {
                            $lookup: {
                                from: 'categories',
                                localField: 'category',
                                foreignField: '_id',
                                as: 'categoryData'
                            }
                        },
                        
                        {
                            $project: {
                                name: 1, description: 1, location: 1, thumbnail: 1,
                                images: 1, capacity: 1, status: 1, startDate: 1,
                                endDate: 1, likesCount: 1, viewCount: 1,
                                registrationsCount: 1, postsCount: 1,
                                trendingScore: 1, createdAt: 1,
                                managerId: { $arrayElemAt: ['$managerData', 0] },
                                category: '$categoryData'
                            }
                        }
                    ],
                    
                    metadata: [
                        { $count: 'totalEvents' }
                    ]
                }
            }
        ]);

        const trendingEvents = results[0].data;
        const totalEvents = results[0].metadata[0] ? results[0].metadata[0].totalEvents : 0;
        const totalPages = Math.ceil(totalEvents / limit);

        if (trendingEvents.length === 0) {
            return res.status(200).json({ 
                success: true, 
                events: [],
                pagination: {
                    currentPage: page,
                    totalPages: 0,
                    totalEvents: 0
                }
            });
        }
        res.status(200).json({
            success: true,
            events: trendingEvents,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalEvents: totalEvents,
                hasNextPage: page < totalPages
            }
        });

    } catch(err) {
        console.error("Error fetching trending events:", err);
        res.status(500).json({ success: false, message: "Server error" });
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
        .populate('category', 'name slug')
        .sort({ createdAt: -1 })
        .lean();
        
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
        .sort({ startDate: 1 })
        .lean();

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
    const {status, page = 1, limit = 10} = req.query; // expected values: "pending", "confirmed", "completed", "cancelled"
    try {
        const [registrations, total] = await Promise.all([
            Registration.find({userId, ...(status ? {status} : {})})
                .populate({
                    path: 'eventId',
                    populate: [
                        { path: 'managerId', select: 'username email avatar' },
                        { path: 'category', select: 'name slug' }
                    ]
                })
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            Registration.countDocuments({userId, ...(status ? {status} : {})})
        ]);
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
        
        res.status(200).json({
            success: true,
            events: eventsWithRegistration,
            pagination: {
                total,
                page: Number(page),
                pages: Math.ceil(total / limit),
                limit: Number(limit)
            }
        })
    }
    catch(err) {
        console.error("Error fetching user events:", err);
        res.status(500).json({success: false, message: "Server error" });
    }
}

export async function addBookMark(req, res) {
    try {
        const userId = req.user.id || req.user._id;
        const eventId = req.params.eventId;
        if(!eventId) {
            return res.status(400).json({success:false, message:"Event ID is required"})
        }
        const user = await User.findById(userId);
        if(!user) {
            return res.status(404).json({success:false, message:"User not found"})
        }
        const isBookmarked = user.bookmarks.some(b => b.toString() === eventId);
        if(isBookmarked) {
            return res.status(400).json({success:false, message:"Event already bookmarked"})
        }
        user.bookmarks.push(eventId);
        await user.save();
        return res.status(201).json({success:true, message:"Bookmark added successfully"})
    }
    catch(error) {
        console.log('Error adding bookmark:', error);
        res.status(500).json({success: false, message: 'Server error'});
    }
}

export async function removeBookMark(req, res) {
    try {
        const userId = req.user.id || req.user._id;
        const eventId = req.params.eventId;
        if(!eventId) {
            return res.status(400).json({success:false, message:"Event ID is required"})
        }
        const user = await User.findById(userId);
        if(!user) {
            return res.status(404).json({success:false, message:"User not found"})
        }
        const isBookmarked = user.bookmarks.some(b => b.toString() === eventId);
        if(!isBookmarked) {
            return res.status(404).json({success:false, message:"Bookmark not found"})
        }
        user.bookmarks = user.bookmarks.filter(b => b.toString() !== eventId);
        await user.save();
        return res.status(200).json({success:true, message:"Bookmark removed successfully"})
    }
    catch(error) {
        console.log('Error removing bookmark:', error);
        res.status(500).json({success: false, message: 'Server error'});
    }
}
