import Event from '../../models/eventModel.js';
import Registration from '../../models/registrationsModel.js';
import Post from '../../models/postModel.js';
import User from '../../models/userModel.js';
import { getOrSetCache, CACHE_TTL } from '../../utils/cacheHelper.js';

export async function getManagerDashboard(req, res) {
    try {
        const managerId = req.user._id;
        const cacheKey = `dashboard:manager:${managerId}`;

        const dashboardData = await getOrSetCache(
            cacheKey,
            CACHE_TTL.DASHBOARD,
            async () => {
                const now = new Date();
                const eventIds = await Event.find({ managerId }).distinct('_id');

                if (eventIds.length === 0) {
                    return {
                        eventStatistics: {
                            total: 0,
                            pending: 0,
                            approved: 0,
                            rejected: 0,
                            completed: 0,
                            cancelled: 0
                        },
                        volunteerStatistics: {
                            total: 0,
                            pending: 0,
                            confirmed: 0,
                            completed: 0,
                            cancelled: 0
                        },
                        activityStatistics: {
                            totalPosts: 0,
                            totalLikes: 0,
                            totalViews: 0,
                            postsLast24h: 0
                        },
                        upcomingEventsCount: 0,
                        generatedAt: new Date()
                    };
                }

                const eventStats = await Event.aggregate([
                    { $match: { managerId } },
                    {
                        $group: {
                            _id: '$status',
                            count: { $sum: 1 }
                        }
                    }
                ]);

                const eventStatsMap = {
                    total: 0,
                    pending: 0,
                    approved: 0,
                    rejected: 0,
                    completed: 0,
                    cancelled: 0
                };
                
                eventStats.forEach(stat => {
                    eventStatsMap[stat._id] = stat.count;
                    eventStatsMap.total += stat.count;
                });

                const volunteerStats = await Registration.aggregate([
                    { $match: { eventId: { $in: eventIds } } },
                    {
                        $group: {
                            _id: '$status',
                            count: { $sum: 1 }
                        }
                    }
                ]);

                const volunteerStatsMap = {
                    total: 0,
                    pending: 0,
                    confirmed: 0,
                    completed: 0,
                    cancelled: 0
                };

                volunteerStats.forEach(stat => {
                    volunteerStatsMap[stat._id] = stat.count;
                    volunteerStatsMap.total += stat.count;
                });

                const [activityStats, postsLast24h] = await Promise.all([
                    Event.aggregate([
                        { $match: { managerId } },
                        {
                            $group: {
                                _id: null,
                                totalPosts: { $sum: '$postsCount' },
                                totalLikes: { $sum: '$likesCount' },
                                totalViews: { $sum: '$viewCount' }
                            }
                        }
                    ]),
                    Post.countDocuments({
                        eventId: { $in: eventIds },
                        createdAt: { $gte: new Date(now - 24 * 60 * 60 * 1000) }
                    })
                ]);

                // 4. Đếm sự kiện sắp diễn ra
                const upcomingEventsCount = await Event.countDocuments({
                    managerId,
                    status: 'approved',
                    startDate: { $gte: now }
                });

                return {
                    eventStatistics: eventStatsMap,
                    volunteerStatistics: volunteerStatsMap,
                    activityStatistics: {
                        totalPosts: activityStats[0]?.totalPosts || 0,
                        totalLikes: activityStats[0]?.totalLikes || 0,
                        totalViews: activityStats[0]?.totalViews || 0,
                        postsLast24h: postsLast24h
                    },
                    upcomingEventsCount,
                    generatedAt: new Date()
                };
            }
        );

        res.status(200).json({
            success: true,
            data: dashboardData
        });
    } catch (error) {
        console.error('Error fetching manager dashboard:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
}


export async function getAdminDashboard(req, res) {
    try {
        const cacheKey = 'dashboard:admin';

        const dashboardData = await getOrSetCache(
            cacheKey,
            CACHE_TTL.DASHBOARD,
            async () => {
                const now = new Date();
                const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);
                const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

                const [
                    totalUsers,
                    totalManagers,
                    totalAdmins,
                    activeUsers,
                    lockedUsers,
                    newUsersThisWeek,
                    newUsersToday
                ] = await Promise.all([
                    User.countDocuments({ role: 'user' }),
                    User.countDocuments({ role: 'manager' }),
                    User.countDocuments({ role: 'admin' }),
                    User.countDocuments({ role: { $in: ['user', 'manager'] }, status: 'active' }),
                    User.countDocuments({ role: { $in: ['user', 'manager'] }, status: 'locked' }),
                    User.countDocuments({ 
                        createdAt: { $gte: oneWeekAgo },
                        role: { $in: ['user', 'manager'] }
                    }),
                    User.countDocuments({ 
                        createdAt: { $gte: oneDayAgo },
                        role: { $in: ['user', 'manager'] }
                    })
                ]);

                const eventStats = await Event.aggregate([
                    {
                        $group: {
                            _id: '$status',
                            count: { $sum: 1 }
                        }
                    }
                ]);

                const eventStatsMap = {
                    total: 0,
                    pending: 0,
                    approved: 0,
                    rejected: 0,
                    completed: 0,
                    cancelled: 0
                };
                
                eventStats.forEach(stat => {
                    eventStatsMap[stat._id] = stat.count;
                    eventStatsMap.total += stat.count;
                });

                const [newEventsThisWeek, newEventsToday] = await Promise.all([
                    Event.countDocuments({ createdAt: { $gte: oneWeekAgo } }),
                    Event.countDocuments({ createdAt: { $gte: oneDayAgo } })
                ]);

                const registrationStats = await Registration.aggregate([
                    {
                        $group: {
                            _id: '$status',
                            count: { $sum: 1 }
                        }
                    }
                ]);

                const registrationStatsMap = {
                    total: 0,
                    pending: 0,
                    confirmed: 0,
                    completed: 0,
                    cancelled: 0
                };

                registrationStats.forEach(stat => {
                    registrationStatsMap[stat._id] = stat.count;
                    registrationStatsMap.total += stat.count;
                });

                const [newRegistrationsThisWeek, newRegistrationsToday] = await Promise.all([
                    Registration.countDocuments({ createdAt: { $gte: oneWeekAgo } }),
                    Registration.countDocuments({ createdAt: { $gte: oneDayAgo } })
                ]);

                const [
                    totalPosts,
                    postsThisWeek,
                    postsToday,
                    activityStats
                ] = await Promise.all([
                    Post.countDocuments(),
                    Post.countDocuments({ createdAt: { $gte: oneWeekAgo } }),
                    Post.countDocuments({ createdAt: { $gte: oneDayAgo } }),
                    Event.aggregate([
                        {
                            $group: {
                                _id: null,
                                totalLikes: { $sum: '$likesCount' },
                                totalViews: { $sum: '$viewCount' },
                                totalPosts: { $sum: '$postsCount' }
                            }
                        }
                    ])
                ]);

                return {
                    userStatistics: {
                        volunteers: {
                            total: totalUsers,
                            active: activeUsers,
                            locked: lockedUsers,
                            newThisWeek: newUsersThisWeek,
                            newToday: newUsersToday
                        },
                        managers: {
                            total: totalManagers
                        },
                        admins: {
                            total: totalAdmins
                        }
                    },

                    eventStatistics: {
                        byStatus: eventStatsMap,
                        byTime: {
                            newThisWeek: newEventsThisWeek,
                            newToday: newEventsToday
                        }
                    },
                    registrationStatistics: {
                        byStatus: registrationStatsMap,
                        byTime: {
                            newThisWeek: newRegistrationsThisWeek,
                            newToday: newRegistrationsToday
                        }
                    },
                    activityStatistics: {
                        posts: {
                            total: totalPosts,
                            thisWeek: postsThisWeek,
                            today: postsToday
                        },
                        engagement: {
                            totalLikes: activityStats[0]?.totalLikes || 0,
                            totalViews: activityStats[0]?.totalViews || 0,
                            totalPosts: activityStats[0]?.totalPosts || 0
                        }
                    },

                    generatedAt: new Date()
                };
            }
        );

        res.status(200).json({
            success: true,
            data: dashboardData
        });
    } catch (error) {
        console.error('Error fetching admin dashboard:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
}
