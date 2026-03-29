const jwt = require('jsonwebtoken');
const redisclient = require("../config/redis.js");
const User = require("../models/user")
const adminmiddleware = async (req, res, next) => {

    try {
        const { token } = req.cookies;
        if (!token) {
            throw new Error("Token is not present");
        }
        const payload = jwt.verify(token, process.env.JWT_KEY);
        const { _id } = payload;
        if (!_id) {
            throw new Error("Invalid token");
        }

        const result = await User.findById(_id);

        if (payload.role != 'admin') {
            throw new Error("Only admin can create the problem");
        }

        if (!result) {
            throw new Error("User doesnt exist");
        }

        //redis ke blocklist mein present toh nahi hai 

        const isblocked = await redisclient.exists(`token:${token}`);

        if (isblocked) {
            throw new Error("Invalid Token");
        }

        req.result = result;

        next();
    }
    catch (err) {
        res.status(401).send("error:" + err.message);
    }
}

module.exports = adminmiddleware;