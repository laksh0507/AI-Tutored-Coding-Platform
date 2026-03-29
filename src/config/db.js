/**
 * @file db.js
 * @description MongoDB connection configuration using Mongoose.
 */

const mongoose = require('mongoose');

/**
 * Establishes a connection to the MongoDB cluster.
 * Uses DB_CONNECT_STRING from environment variables.
 */
async function connectDB() {
   await mongoose.connect(process.env.DB_CONNECT_STRING);
}

module.exports = connectDB;
