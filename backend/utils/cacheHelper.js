import redisClient from '../config/redis.js';

// Định nghĩa TTL (Time To Live) cho các loại cache khác nhau
export const CACHE_TTL = {
    CATEGORIES: 3600,        // 1 giờ - Categories ít thay đổi
    EVENTS_LIST: 300,        // 5 phút - Danh sách events (giảm từ 10 phút)
    EVENT_DETAIL: 1800,      // 30 phút - Chi tiết event (không dùng nữa)
    USER_PROFILE: 1800,      // 30 phút - Profile user
    TRENDING: 180,           // 3 phút - Trending events (giảm từ 5 phút, thay đổi nhanh)
    DASHBOARD: 180,          // 3 phút - Dashboard data (giảm từ 5 phút)
    POSTS: 300               // 5 phút - Posts trong event wall
};

/**
 * Lấy dữ liệu từ cache hoặc fetch từ database nếu không có
 * @param {string} key - Cache key
 * @param {number} ttlSec - Time to live trong giây
 * @param {Function} fetcher - Async function để lấy dữ liệu từ DB
 * @returns {Promise<any>} - Dữ liệu từ cache hoặc DB
 */
export async function getOrSetCache(key, ttlSec, fetcher) {
    try {
        // Bước 1: Kiểm tra cache có tồn tại không
        const cached = await redisClient.get(key);
        
        if (cached) {
            console.log(`✅ Cache HIT: ${key}`);
            return JSON.parse(cached);
        }

        console.log(`❌ Cache MISS: ${key} - Fetching from DB...`);
        
        
        const fresh = await fetcher();
        
        if (fresh !== undefined && fresh !== null) {
            await redisClient.set(key, JSON.stringify(fresh), { EX: ttlSec });
            console.log(`💾 Cached: ${key} (TTL: ${ttlSec}s)`);
        }
        
        return fresh;
    } catch (error) {
        console.error(`⚠️ Cache error for key "${key}":`, error.message);
      
        try {
            return await fetcher();
        } catch (fetchError) {
            console.error(`❌ Fetcher error:`, fetchError);
            throw fetchError;
        }
    }
}

/**

 * @param {...string} keys 
 */
export async function invalidateCache(...keys) {
    if (!keys.length) return;
    
    try {
        await Promise.all(keys.map(key => redisClient.del(key)));
        console.log(`🗑️ Invalidated cache key(s):`, keys);
    } catch (error) {
        console.error('⚠️ Cache invalidation error:', error.message);
    }
}

/**
 * Xóa nhiều cache keys theo pattern (wildcard)
 * Ví dụ: invalidateCacheByPattern('events:*') sẽ xóa tất cả keys bắt đầu bằng 'events:'
 * @param {string} pattern - Pattern để match keys (hỗ trợ wildcard *)
 */
export async function invalidateCacheByPattern(pattern) {
    try {
        const keys = [];
        
        // Sử dụng SCAN để tìm tất cả keys match pattern
        for await (const result of redisClient.scanIterator({ MATCH: pattern, COUNT: 100 })) {
            if (Array.isArray(result)) {
                keys.push(...result);
            } else {
                keys.push(result);
            }
        }
        
        // Filter valid keys
        const validKeys = keys.filter(k => k && typeof k === 'string');
        
        if (validKeys.length > 0) {
            console.log(`Found ${validKeys.length} keys for pattern ${pattern}:`, validKeys);
            // Delete sequentially to avoid issues
            for (const key of validKeys) {
                await redisClient.del(key);
            }
            console.log(`🗑️ Invalidated ${validKeys.length} cache key(s) matching pattern: ${pattern}`);
        } else {
            console.log(`ℹ️ No cache keys found for pattern: ${pattern}`);
        }
    } catch (error) {
        console.error(`⚠️ Cache pattern invalidation error for "${pattern}":`, error.message);
    }
}

/**
 * Xóa toàn bộ cache (Cẩn thận khi dùng!)
 */
export async function flushAllCache() {
    try {
        await redisClient.flushAll();
        console.log('🗑️ ALL cache flushed!');
    } catch (error) {
        console.error('⚠️ Cache flush error:', error);
    }
}
