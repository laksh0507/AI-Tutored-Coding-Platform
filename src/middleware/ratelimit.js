const redisclient = require('../config/redis');

const ratelimit = async (req, res, next) => {
    try {
        const userId = req.result._id.toString();
        const key = `ratelimit:${userId}`;

        const requests = await redisclient.incr(key);

        if (requests === 1) {
            await redisclient.expire(key, 60); // 60 second window
        }

        if (requests > 10) {
            return res.status(429).json({
                error: 'Too many requests. Please wait a minute before trying again.'
            });
        }

        next();
    } catch (err) {
        // If Redis fails, don't block the user — just continue
        console.warn('Rate limit check failed:', err.message);
        next();
    }
};

module.exports = ratelimit;
