/**
 * @file adminmiddleware.js
 * @description Middleware to restrict access to admin-only routes.
 * Verifies JWT tokens and ensures the user has an 'admin' role.
 */

const jwt = require('jsonwebtoken');
const redisClient = require("../config/redis.js");
const User = require("../models/user");

/**
 * Middleware to verify admin authorization.
 */
const adminMiddleware = async (req, res, next) => {
    try {
        const { token } = req.cookies;
        if (!token) throw new Error("Token is not present");

        const payload = jwt.verify(token, process.env.JWT_KEY);
        const { _id, role } = payload;
        
        if (!_id) throw new Error("Invalid token");
        if (role !== 'admin') throw new Error("Unauthorized: Admin access required");

        const user = await User.findById(_id);
        if (!user) throw new Error("User does not exist");

        // Check if token has been invalidated via logout
        const isBlocked = await redisClient.exists(`token:${token}`);
        if (isBlocked) throw new Error("Invalid Token");

        req.result = user;
        next();
    }
    catch (err) {
        res.status(401).send("error: " + err.message);
    }
}

module.exports = adminMiddleware;