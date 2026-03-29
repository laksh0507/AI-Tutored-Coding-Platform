/**
 * Authentication Middleware
 * 
 * Purpose: Verify JWT token and protect routes from unauthorized access
 * 
 * Security Checks Performed:
 * 1. Token exists in cookie
 * 2. Token signature is valid (not tampered)
 * 3. Token is not expired
 * 4. User ID exists in token payload
 * 5. User exists in database
 * 6. Token is not in Redis blocklist (user didn't logout)
 * 
 * If all checks pass: Sets req.result and calls next()
 * If any check fails: Returns 401 Unauthorized
 */

const jwt = require('jsonwebtoken');
const redisclient = require('../config/redis.js');
const User = require('../models/user');

// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================

const usermiddleware = async (req, res, next) => {
  try {
    // ============ SECURITY CHECK 1: Token Exists ============
    // Get token from request cookies (set by cookieParser middleware)
    const { token } = req.cookies;

    // If token is missing, user is not authenticated
    if (!token) {
      throw new Error('Token is not present');
    }

    // ============ SECURITY CHECKS 2 & 3: Token Valid & Not Expired ============
    // jwt.verify() performs two critical checks:
    // 1. Verifies signature hasn't been tampered (ensures authenticity)
    // 2. Checks expiration time (ensures token is still valid)
    // If either check fails, it automatically throws an error
    const payload = jwt.verify(token, process.env.JWT_KEY);

    // Extract user ID from the decoded token payload
    const { _id } = payload;

    // ============ SECURITY CHECK 4: User Exists in Database ============
    // User might have been deleted after login
    // Old token would still be cryptographically valid
    // But user shouldn't have access if they're deleted from database
    
    const result = await User.findById(_id);
    if (!result) {
      throw new Error('User doesnt exist');
    }

    //check if user is active
    if(!result.isActive)
    {
        throw new Error("User is not active");
    }

    // ============ SECURITY CHECK 6: Token Not in Blocklist ============
    // When user logs out, their token is added to Redis blocklist
    // This prevents using old tokens after logout
    // Key format: "token:{actual_token_string}"
    // redis exists() returns 1 if key found (token blocked), 0 if not found
    const isblocked = await redisclient.exists(`token:${token}`);

    if (isblocked) {
      throw new Error('Invalid Token');
    }

    // ============ ALL SECURITY CHECKS PASSED ============
    // Attach full user document to request object
    // Other route handlers can access user data via req.result
    // Contains: _id, firstname, emailId, password, role, etc.
    req.result = result;

    // Continue to next middleware or route handler
    next();

  } catch (err) {
    // If ANY security check fails, deny access with 401 Unauthorized
    res.status(401).json({
      success: false,
      message: 'Unauthorized',
      error: err.message
    });
  }
};

module.exports = usermiddleware;