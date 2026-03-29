const { createClient } = require('redis');

const redisclient = createClient({
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

// Prevent unhandled 'error' event from crashing the server
redisclient.on('error', (err) => {
    console.warn("⚠️  Redis error:", err.message);
});

redisclient.on('reconnecting', () => {
    console.log("🔄 Redis: reconnecting...");
});

module.exports = redisclient;
