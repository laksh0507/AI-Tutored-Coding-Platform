/**
 * @file index.js
 * @description Application entry point for the platform Backend.
 * Initializes database connections, configures middleware, and defines top-level routes.
 * @author LAKSHMISHA R A
 * @version 1.0.0
 */

const express = require('express');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const expressApp = express();

const connectDB = require("./config/db");
const cookieParser = require('cookie-parser');
const redisClient = require("./config/redis.js");

// Route Imports
const authRouter = require("./routes/userauth.js");
const problemRouter = require("./routes/problemcreator.js");
const submitRouter = require("./routes/submit.js");
const hintRouter = require("./routes/hint.js");

/**
 * Parse application/x-www-form-urlencoded
 */
expressApp.use(express.json());
expressApp.use(cookieParser());
expressApp.use('/user', authRouter);
expressApp.use('/problem', problemRouter);
expressApp.use('/submit', submitRouter);
expressApp.use('/hint', hintRouter);

const initializeConnection = async () => {
    try {
        await connectDB();
        console.log("MongoDB Connected Successfully");

        try {
            await redisClient.connect();
            console.log("Redis Connected Successfully");
        } catch (redisErr) {
            console.warn("⚠️  Redis connection failed: " + redisErr.message);
        }

        expressApp.listen(process.env.PORT, () => {
            console.log("Server listening at port: " + process.env.PORT);
        });
    } catch (err) {
        console.error("Initialization Error: " + err.message);
    }
}

initializeConnection();
