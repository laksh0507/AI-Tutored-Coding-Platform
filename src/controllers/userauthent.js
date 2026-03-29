/**
 * @file userauthent.js
 * @description Controllers for User Authentication and Account Management.
 * Handles registration, login, logout, and profile lifecycle (deactivation/deletion).
 */

const redisClient = require("../config/redis");
const User = require("../models/user");
const validateRequest = require('../utils/validator');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const Submission = require("../models/submission");

/**
 * Registers a new user.
 * @route POST /user/register
 */
const register = async (req, res) => {
    try {
        validateRequest(req.body);
        const { emailId, password } = req.body;
        
        // Hash password before saving
        req.body.password = await bcrypt.hash(password, 10);
        req.body.role = "user";

        const user = await User.create(req.body);
        
        // Generate initial session token
        const token = jwt.sign(
            { _id: user._id, emailId: emailId, role: "user" }, 
            process.env.JWT_KEY, 
            { expiresIn: '1h' }
        );
        
        res.cookie('token', token, { maxAge: 3600000, httpOnly: true });
        res.status(201).send("User registered successfully");
    }
    catch (err) {
        res.status(400).send(err.message);
    }
}

/**
 * authenticates a user and starts a session.
 * @route POST /user/login
 */
const login = async (req, res) => {
    try {
        const { emailId, password } = req.body;
        if (!emailId || !password) throw new Error("Invalid Credentials");

        const user = await User.findOne({ emailId });
        if (!user) throw new Error("Invalid credentials");

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new Error("Invalid credentials");

        if (!user.isActive) {
            return res.status(403).json({
                deactivated: true,
                message: "Account is deactivated"
            });
        }

        const token = jwt.sign(
            { _id: user._id, emailId: emailId, role: user.role }, 
            process.env.JWT_KEY, 
            { expiresIn: '1h' }
        );
        
        res.cookie('token', token, { maxAge: 3600000, httpOnly: true });
        res.status(200).send("logged in successfully");
    }
    catch (err) {
        res.status(401).send("Error: " + err.message);
    }
}

/**
 * Ends a user session and invalidates the token in Redis.
 * @route POST /user/logout
 */
const logout = async (req, res) => {
    try {
        const { token } = req.cookies;
        const payload = jwt.decode(token);
        
        // Add token to Redis block-list until it expires
        await redisClient.set(`token:${token}`, "blocked");
        await redisClient.expireAt(`token:${token}`, payload.exp);

        res.cookie("token", null, { expires: new Date(0) });
        res.send("logged out successfully");
    }
    catch (err) {
        res.status(503).send("Error: " + err.message);
    }
}

/**
 * Admin-only route to register a new admin user.
 * Restricted by adminmiddleware.
 */
const adminregister = async (req, res) => {
    try {
        validateRequest(req.body);
        const { emailId, password } = req.body;
        req.body.password = await bcrypt.hash(password, 10);
        req.body.role = "admin";

        await User.create(req.body);
        res.status(201).send("Admin user created successfully.");
    }
    catch (err) {
        res.status(400).send("Error: " + err.message);
    }
}

/**
 * Permanently deletes a user profile and all associated data.
 * @route DELETE /user/profile
 */
const deleteprofile = async (req, res) => {
    try {
        const userid = req.result._id;
        
        await User.findByIdAndDelete(userid);
        await Submission.deleteMany({ userid });

        // Invalidate current session
        const { token } = req.cookies;
        const payload = jwt.decode(token);
        await redisClient.set(`token:${token}`, "blocked");
        await redisClient.expireAt(`token:${token}`, payload.exp);
        
        res.cookie("token", null, { expires: new Date(0) });
        res.status(200).send("deleted successfully");
    }
    catch (err) {
        res.status(500).send("internal server error");
    }
}

/**
 * Soft-deactivates a user profile.
 * @route PATCH /user/deactivate
 */
const deactivateprofile = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.result._id, { isActive: false });
        res.cookie("token", null, { expires: new Date(0) });
        res.status(200).send("deactivated successfully");
    }
    catch (err) {
        res.status(500).send("internal server error");
    }
}

/**
 * Reactivates a deactivated account upon successful login.
 * @route POST /user/activate
 */
const activateprofile = async (req, res) => {
    try {
        const { emailId, password } = req.body;

        const user = await User.findOne({ emailId });
        if (!user) throw new Error("Invalid Credentials");

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) throw new Error("Invalid Credentials");

        user.isActive = true;
        await user.save();

        const token = jwt.sign(
            { _id: user._id, emailId: user.emailId, role: user.role },
            process.env.JWT_KEY,
            { expiresIn: '1h' }
        );
        res.cookie('token', token, { maxAge: 3600000, httpOnly: true });

        res.status(200).send("Account reactivated and logged in successfully");
    } catch (err) {
        res.status(401).send("Error: " + err.message);
    }
};

module.exports = { register, login, logout, adminregister, deleteprofile, deactivateprofile, activateprofile };