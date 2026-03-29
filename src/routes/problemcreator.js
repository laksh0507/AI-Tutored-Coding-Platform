/**
 * @file problemcreator.js
 * @description API Routes for Problem Management.
 * Includes routes for creating, updating, and retrieving coding problems.
 */

const express = require('express');
const problemRouter = express.Router();
const adminMiddleware = require("../middleware/adminmiddleware");
const userMiddleware = require("../middleware/usermiddleware");
const { 
    createproblem, 
    updateproblem, 
    deleteproblem, 
    getproblembyid, 
    getallproblem, 
    solvedallproblembyuser, 
    submittedproblem 
} = require("../controllers/userproblem");

// Admin Routes
problemRouter.post("/create", adminMiddleware, createproblem);
problemRouter.put("/update/:id", adminMiddleware, updateproblem);
problemRouter.delete("/delete/:id", adminMiddleware, deleteproblem);

// User Routes (Authenticated)
problemRouter.get("/problembyid/:id", userMiddleware, getproblembyid);
problemRouter.get("/getallproblem", userMiddleware, getallproblem);
problemRouter.get("/problemsolvedbyuser", userMiddleware, solvedallproblembyuser);
problemRouter.get("/submittedproblem/:id", userMiddleware, submittedproblem);

module.exports = problemRouter;