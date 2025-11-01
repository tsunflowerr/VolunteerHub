import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import redisClient from '../config/redis.js';

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    store: new RedisStore({
        client: redisClient,
        prefix: 'rl:auth:',
    }),
    message: {
        success: false,
        message: 'Too many login attempts, please try again after 15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
});

export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    store: new RedisStore({
        client: redisClient,
        prefix: 'rl:api:',
    }),
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export const registrationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3,
    store: new RedisStore({
        client: redisClient,
        prefix: 'rl:register:',
    }),
    message: {
        success: false,
        message: 'Too many account registrations, please try again after 1 hour'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
});

export const createLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    store: new RedisStore({
        client: redisClient,
        prefix: 'rl:create:',
    }),
    message: {
        success: false,
        message: 'Too many create requests, please slow down'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 20,
    store: new RedisStore({
        client: redisClient,
        prefix: 'rl:upload:',
    }),
    message: {
        success: false,
        message: 'Too many upload requests, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export const searchLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    store: new RedisStore({
        client: redisClient,
        prefix: 'rl:search:',
    }),
    message: {
        success: false,
        message: 'Too many search requests, please slow down'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3,
    store: new RedisStore({
        client: redisClient,
        prefix: 'rl:pwreset:',
    }),
    message: {
        success: false,
        message: 'Too many password reset attempts, please try again after 1 hour'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export const likeLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    store: new RedisStore({
        client: redisClient,
        prefix: 'rl:like:',
    }),
    message: {
        success: false,
        message: 'Too many like requests, please slow down'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export const bookmarkLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    store: new RedisStore({
        client: redisClient,
        prefix: 'rl:bookmark:',
    }),
    message: {
        success: false,
        message: 'Too many bookmark requests, please slow down'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export const updateLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    store: new RedisStore({
        client: redisClient,
        prefix: 'rl:update:',
    }),
    message: {
        success: false,
        message: 'Too many update requests, please slow down'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export const registrationActionLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    store: new RedisStore({
        client: redisClient,
        prefix: 'rl:regaction:',
    }),
    message: {
        success: false,
        message: 'Too many registration requests, please slow down'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export const deleteLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    store: new RedisStore({
        client: redisClient,
        prefix: 'rl:delete:',
    }),
    message: {
        success: false,
        message: 'Too many delete requests, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
