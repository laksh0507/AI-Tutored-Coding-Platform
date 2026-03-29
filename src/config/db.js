/**
 * @file db.js
 * @description MongoDB connection configuration using Mongoose.
 */

const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
dns.setDefaultResultOrder('ipv4first');

/**
 * Establishes a connection to the MongoDB cluster.
 * Uses DB_CONNECT_STRING from environment variables.
 */
async function connectDB() {
   await mongoose.connect(process.env.DB_CONNECT_STRING);
}

module.exports = connectDB;
