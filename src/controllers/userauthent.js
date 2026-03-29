const redisclient = require("../config/redis");
const User = require("../models/user");
const validate = require('../utils/validator');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const submission = require("../models/submission");
const register = async (req, res) => {
    try {
        //validate the data;
        validate(req.body);
        const { firstname, emailId, password } = req.body;
        req.body.password = await bcrypt.hash(password, 10);
        req.body.role = "user"

        const user = await User.create(req.body);
        const token = jwt.sign({ _id: user._id, emailId: emailId, role: "user" }, process.env.JWT_KEY, { expiresIn: 60 * 60 });
        res.cookie('token', token, { maxAge: 60 * 60 * 1000 });
        res.status(201).send("User registered sucessfully");
    }
    catch (err) {
        res.status(400).send(err.message);

    }
}

const login = async (req, res) => {
    try {
        const { emailId, password } = req.body;
        if (!emailId)
            throw new Error("Invalid Credentials");
        if (!password)
            throw new Error("Invalid Credentials");
        const user = await User.findOne({ emailId });

        const ans = await bcrypt.compare(password, user.password);
        if (!ans) {
            throw new Error("Invalid credentials");
        }

        if (!user.isActive) {
            return res.status(403).json({
                deactivated: true,
                message: "Account is deactivated"
            });
        }

        const token = jwt.sign({ _id: user._id, emailId: emailId, role: user.role }, process.env.JWT_KEY, { expiresIn: 60 * 60 });
        res.cookie('token', token, { maxAge: 60 * 60 * 1000 });
        res.status(200).send("logged in sucessfully");
    }
    catch (err) {
        res.status(401).send("Error:" + err);
    }
}

const logout = async (req, res) => {
    try {
        //validate the token
        //add token to the redis block-list
        const { token } = req.cookies;
        const payload = jwt.decode(token);
        await redisclient.set(`token:${token}`, "blocked");
        await redisclient.expireAt(`token:${token}`, payload.exp);

        res.cookie("token", null, { expires: new Date(Date.now()) });
        res.send("logged out sucessfully");
    }
    catch (err) {
        res.status(503).send("Error:" + err.message);
    }
}

/**
 * Admin Registration
 * 
 * How it works in real-world production systems:
 * 1. The FIRST admin is always created manually (database seeding or direct DB insert).
 * 2. After that, existing admins can create new admins via this protected API.
 * 3. This API is NEVER exposed on the public website — it is only accessible
 *    through a separate internal admin dashboard (e.g., admin.leetcode.com),
 *    which is typically restricted to the company's VPN/internal network.
 * 4. No token/cookie is returned here because the admin is creating an account
 *    for someone else — only the new user's credentials are shared securely.
 * 
 * Role hierarchy: SuperAdmin → Admin → User
 * Public users can never access this route (protected by adminmiddleware).
 */
const adminregister = async (req, res) => {
    try {
        //validate the data;
        validate(req.body);
        const { firstname, emailId, password } = req.body;
        req.body.password = await bcrypt.hash(password, 10);
        req.body.role = "admin";

        const user = await User.create(req.body);

        res.status(201).send("Admin user created successfully. Credentials can now be shared securely.");
    }
    catch (err) {
        res.status(400).send("Error:" + err);

    }
}

const deleteprofile = async (req, res) => {
    try {
        const userid = req.result._id;
        //deleted from userschema
        await User.findByIdAndDelete(userid);
        //delelted from submission schema 
        await submission.deleteMany({ userid });

        //blocklist the token in redis and clear the cookie (auto-logout)
        const { token } = req.cookies;
        const payload = jwt.decode(token);
        await redisclient.set(`token:${token}`, "blocked");
        await redisclient.expireAt(`token:${token}`, payload.exp);
        res.cookie("token", null, { expires: new Date(Date.now()) });

        res.status(200).send("deleted sucessfully");
    }
    catch (err) {
        res.status(500).send("internal server error");
    }
}

const deactivateprofile = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.result._id, { isActive: false });
        res.cookie("token", null, { expires: new Date(Date.now()) });
        res.status(200).send("deactivated sucessfully");
    }
    catch (err) {
        res.status(500).send("internal server error");
    }
}

const activateprofile = async (req, res) => {
    try {
        const { emailId, password } = req.body;

        // 1. Find the user
        const user = await User.findOne({ emailId });
        if (!user) {
            throw new Error("Invalid Credentials");
        }

        // 2. Check password
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            throw new Error("Invalid Credentials");
        }

        // 3. Reactivate!
        user.isActive = true;
        await user.save();

        // 4. Log them in immediately (issue token)
        const token = jwt.sign(
            { _id: user._id, emailId: user.emailId, role: user.role },
            process.env.JWT_KEY,
            { expiresIn: 60 * 60 }
        );
        res.cookie('token', token, { maxAge: 60 * 60 * 1000 });

        res.status(200).send("Account reactivated and logged in successfully");
    } catch (err) {
        res.status(401).send("Error: " + err.message);
    }
};


module.exports = { register, login, logout, adminregister, deleteprofile, deactivateprofile, activateprofile };