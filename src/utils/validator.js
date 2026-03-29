/**
 * @file validator.js
 * @description Utility for validating incoming user request data.
 * Ensures mandatory fields are present and strings meet security/format standards.
 */

const validator = require('validator');

/**
 * Validates user registration/update data.
 * Ensures:
 * 1. mandatory fields exist (firstname, emailId, password)
 * 2. Email format is valid
 * 3. Password meets strength requirements
 * 
 * @param {Object} data - Request body to validate
 * @throws {Error} Descriptive error message upon validation failure
 * @returns {boolean} Returns true if validation passes
 */
const validateRequest = (data) => {
    if (!data) throw new Error("Data is required");

    // Check mandatory fields
    const mandatoryFields = ['firstname', 'emailId', 'password'];
    for (const key of mandatoryFields) {
        if (!(key in data) || data[key] === null || data[key] === undefined) {
            throw new Error(`${key} is missing or invalid`);
        }
    }

    // Email validation
    if (!validator.isEmail(data.emailId)) {
        throw new Error("Invalid Email format");
    }

    // Password strength check (min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 symbol)
    if (!validator.isStrongPassword(data.password)) {
        throw new Error("Weak Password: Requires at least 8 characters, including upper, lower, numbers, and symbols.");
    }

    return true;
};

module.exports = validateRequest;
