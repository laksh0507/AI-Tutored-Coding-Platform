/**
 * @file redis.js
 * @description Redis client configuration.
 * Used for token blocklisting (logout) and rate limiting.
 */

const { createClient } = require('redis');

/**
 * Initializes the Redis client with custom reconnect strategies and error handling.
 */
const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: 'redis-10974.crce214.us-east-1-3.ec2.cloud.redislabs.com',
        port: 10974,
        reconnectStrategy: (retries) => {
            if (retries > 10) {
                console.warn("⚠️  Redis: max reconnect attempts reached, giving up.");
                return false;
            }
            // Exponential backoff: 500ms, 1s, 2s, 4s...
            return Math.min(retries * 500, 5000);
        }
    }
});

// Event listener to prevent unhandled 'error' event from crashing the server
redisClient.on('error', (err) => {
    console.warn("⚠️  Redis error:", err.message);
});

redisClient.on('reconnecting', () => {
    console.log("🔄 Redis: reconnecting...");
});

module.exports = redisClient;
