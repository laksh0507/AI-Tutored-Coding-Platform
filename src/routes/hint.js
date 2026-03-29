/**
 * @file hint.js
 * @description API Routes for the Hint System.
 */

const express = require('express');
const hintRouter = express.Router();
const userMiddleware = require('../middleware/usermiddleware');
const rateLimitMiddleware = require('../middleware/ratelimit');
const { gethint, aihint, getfullsolution } = require('../controllers/userhint');

// All hint routes are protected by authentication and rate limiting
hintRouter.get('/:id', userMiddleware, rateLimitMiddleware, gethint);
hintRouter.post('/ai/:id', userMiddleware, rateLimitMiddleware, aihint);
hintRouter.get('/solution/:id', userMiddleware, rateLimitMiddleware, getfullsolution);

module.exports = hintRouter;
