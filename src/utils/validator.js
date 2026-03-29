const validator = require('validator');

/**
 * Validate user data
 * @param {Object} data - User data to be validated
 * @throws {Error} If some field is missing or invalid
 * @returns {Boolean} True if the data is valid, false otherwise
 */
const validate = (data) => {
    if (!data) {
        throw new Error("data is null or undefined");
    }

    /**
     * We need to check if all mandatory fields are present in the data object.
     * If any field is missing, we throw an error.
     */
    const mandatoryFields = ['firstname', 'emailId', 'password'];
    let isAllowed = true; // Use 'let' not 'const' since we change it

    // Loop through all the mandatory fields and check if they are present in the data object
    for (const key of mandatoryFields) {
        if (!(key in data) || data[key] === null || data[key] === undefined) { // Check if the key is present in the data object and not null or undefined
            isAllowed = false;
            break; // If any field is missing, break the loop and throw an error
        }
    }

    // If any of the mandatory fields are missing, throw an error
    if (!isAllowed) {
        throw new Error("some field missing");
    }

    /**
     * We need to validate the email address and password.
     * If the email address is invalid or the password is weak, throw an error.
     */

    if (!validator.isEmail(data.emailId)) { // Check if the email address is valid
        throw new Error("Invalid Email");
    }

    if (!validator.isStrongPassword(data.password)) { // Check if the password is strong
        throw new Error("Weak Password");
    }


    return true; // If all the fields are valid, return true
};

module.exports = validate;
