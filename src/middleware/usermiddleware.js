/**
 * @file usermiddleware.js
 * @description Authentication Middleware to protect user-level routes.
 * Verifies JWT tokens, checks database existence, and validates against Redis blocklist.
 */

const jwt = require('jsonwebtoken');
const redisClient = require('../config/redis.js');
const User = require('../models/user');

/**
 * Middleware to verify user authentication.
 * Performs multiple security checks and attaches the user object to the request.
 */
const userMiddleware = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) throw new Error('Token is not present');

    // Verify token signature and expiration
    const payload = jwt.verify(token, process.env.JWT_KEY);
    const { _id } = payload;

    // Verify user still exists in database and is active
    const user = await User.findById(_id);
    if (!user) throw new Error('User does not exist');
    if (!user.isActive) throw new Error("User is not active");

    // Check if token has been invalidated via logout (Redis blocklist)
    const isBlocked = await redisClient.exists(`token:${token}`);
    if (isBlocked) throw new Error('Invalid Token');

    // Attach user to request for use in controllers
    req.result = user;
    next();

  } catch (err) {
    res.status(401).json({
      success: false,
      message: 'Unauthorized',
      error: err.message
    });
  }
};

module.exports = userMiddleware;