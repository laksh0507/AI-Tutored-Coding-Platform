/**
 * @file ratelimit.js
 * @description Rate Limiting Middleware using Redis.
 * Protects expensive resources (like AI hints) from abuse by limiting 
 * requests per user within a sliding time window.
 */

const redisClient = require('../config/redis');

/**
 * Middleware to enforce rate limiting.
 * Default: 10 requests per 60 seconds per user.
 */
const rateLimitMiddleware = async (req, res, next) => {
    try {
        const userId = req.result._id.toString();
        const key = `ratelimit:${userId}`;

        // Increment request count for this user
        const requests = await redisClient.incr(key);

        // Set expiration on first request in the window
        if (requests === 1) {
            await redisClient.expire(key, 60); 
        }

        // Check if limit exceeded
        if (requests > 10) {
            return res.status(429).json({
                error: 'Too many requests. Please wait a minute before trying again.'
            });
        }

        next();
    } catch (err) {
        // High Availability: If Redis fails, fall back to allowing the request
        console.warn('Rate limit check failed (Redis down?):', err.message);
        next();
    }
};

module.exports = rateLimitMiddleware;
