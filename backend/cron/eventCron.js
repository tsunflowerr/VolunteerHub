import cron from 'node-cron';
import eventModel from '../models/eventModel.js';
import Registration from '../models/registrationsModel.js';
import { invalidateCacheByPattern, invalidateCache } from '../utils/cacheHelper.js';

const checkAndCompleteEvents = async () => {
    console.log('⏳ Running scheduled check for completed events...');
    try {
        const now = new Date();
        
        // Find events that are 'approved' (active) and have ended
        const eventsToComplete = await eventModel.find({
            status: 'approved',
            endDate: { $lt: now }
        });

        if (eventsToComplete.length > 0) {
            const eventIds = eventsToComplete.map(event => event._id);
            
            // Update status to 'completed'
            const result = await eventModel.updateMany(
                { _id: { $in: eventIds } },
                { $set: { status: 'completed' } }
            );

            console.log(`✅ Marked ${result.modifiedCount} events as completed.`);

            // Invalidate relevant caches
            await invalidateCacheByPattern('events:all:*');
            await invalidateCacheByPattern('events:trending:*');
            await invalidateCacheByPattern('events:upcoming:*');
            await invalidateCacheByPattern('events:category:*');
            await invalidateCacheByPattern('search:events:*');
            
            // Invalidate specific event details
            const detailKeys = eventIds.map(id => `event:detail:${id}`);
            await invalidateCache(...detailKeys);
            
            console.log(`🗑️ Invalidated caches for ${eventIds.length} completed events.`);
        } else {
            console.log('ℹ️ No events to mark as completed.');
        }
    } catch (error) {
        console.error('❌ Error in event completion cron job:', error);
    }
};

/**
 * Sync registrationsCount for all events based on actual confirmed registrations
 * This fixes any discrepancies caused by deleted users or bugs
 */
const syncRegistrationsCounts = async () => {
    console.log('🔄 Running registrations count sync...');
    try {
        // Get actual count of confirmed registrations per event
        const registrationCounts = await Registration.aggregate([
            {
                $match: {
                    status: { $in: ['confirmed', 'completed'] }
                }
            },
            {
                $group: {
                    _id: '$eventId',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Create a map of eventId -> count
        const countMap = new Map(
            registrationCounts.map(r => [r._id.toString(), r.count])
        );

        // Get all events
        const events = await eventModel.find({}).select('_id registrationsCount').lean();

        let updatedCount = 0;
        for (const event of events) {
            const actualCount = countMap.get(event._id.toString()) || 0;
            
            if (event.registrationsCount !== actualCount) {
                await eventModel.findByIdAndUpdate(event._id, {
                    registrationsCount: actualCount
                });
                console.log(`📊 Event ${event._id}: ${event.registrationsCount} → ${actualCount}`);
                updatedCount++;
            }
        }

        if (updatedCount > 0) {
            console.log(`✅ Synced registrations count for ${updatedCount} events.`);
            // Invalidate caches
            await invalidateCacheByPattern('events:*');
        } else {
            console.log('ℹ️ All events have correct registrations count.');
        }
    } catch (error) {
        console.error('❌ Error syncing registrations count:', error);
    }
};

export const initEventCronJobs = () => {
    // Run immediately on startup to catch up
    checkAndCompleteEvents();
    syncRegistrationsCounts(); // Sync counts on startup

    // Run every hour: 0 * * * *
    cron.schedule('0 * * * *', () => {
        checkAndCompleteEvents();
    });

    // Sync registrations count every 6 hours
    cron.schedule('0 */6 * * *', () => {
        syncRegistrationsCounts();
    });
    
    console.log('🕒 Event Cron Jobs initialized (Schedule: Every hour for completion, every 6 hours for count sync)');
};
