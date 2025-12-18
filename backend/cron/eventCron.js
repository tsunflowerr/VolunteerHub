import cron from 'node-cron';
import eventModel from '../models/eventModel.js';
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
            await invalidateCacheByPattern('events:upcoming');
            await invalidateCacheByPattern('events:category:*');
            
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

export const initEventCronJobs = () => {
    // Run immediately on startup to catch up
    checkAndCompleteEvents();

    // Run every hour: 0 * * * *
    cron.schedule('0 * * * *', () => {
        checkAndCompleteEvents();
    });
    
    console.log('🕒 Event Cron Jobs initialized (Schedule: Every hour + Immediate check)');
};
