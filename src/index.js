/**
 * Main application file
 * @module index
 * @author [Your Name]
 * @requires express
 * @requires dotenv
 * @requires ./config/db
 * @requires cookie-parser
 * @requires ./routes/userauth
 * @requires ./config/redis
 * @requires ./routes/problemcreator
 */
const express = require('express');//
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const app = express();//
const main = require("./config/db");//
const cookieParser = require('cookie-parser');//
const authRouter = require("./routes/userauth.js");//
const redisclient = require("./config/redis.js");//
const problemRouter = require("./routes/problemcreator.js");//
const submitRouter = require("./routes/submit.js");//
const hintRouter = require("./routes/hint.js");//

/**
 * Parse application/x-www-form-urlencoded
 */
app.use(express.json());

/**
 * Parse cookies and add them to req.cookies
 */
app.use(cookieParser());

/**
 * All routes starting with /user will be handled by authRouter
 */
app.use('/user', authRouter);

/**
 * All routes starting with /problem will be handled by problemRouter
 */
app.use('/problem', problemRouter);

/**
 * All routes starting with /submit will be handled by submitRouter
 */
app.use('/submit', submitRouter);

/**
 * All routes starting with /hint will be handled by hintRouter
 */
app.use('/hint', hintRouter);

/**
 * Function to initialize connection to database and redis
 * @function initializeConnection
 * @returns {Promise<void>} Promise to initialize connection
 */
const initializeConnection = async () => {
    try {
        // Connect to MongoDB (required)
        await main();
        console.log("DB Connected");

        // Connect to Redis (optional - used for token blocklist)
        try {
            await redisclient.connect();
            console.log("Redis Connected");
        } catch (redisErr) {
            console.warn("⚠️  Redis connection failed (logout token blocklist won't work): " + redisErr.message);
            console.warn("   Server will still run but logout/token-blocking features are disabled.");
        }

        app.listen(process.env.PORT, () => {
            console.log("Server listening at port number: " + process.env.PORT);
        });
    } catch (err) {
        console.log("Error: " + err.message);
    }
}

/**
 * Initialize connection to database and redis
 */
initializeConnection();
