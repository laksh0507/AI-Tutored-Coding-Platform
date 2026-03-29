/**
 * @file problemutility.js
 * @description Helper functions for language mapping and Judge0 API interaction.
 * Handles batch submissions and polling for execution results.
 */

const axios = require("axios");

/**
 * Maps human-readable language names to Judge0 language IDs.
 * @param {string} lang - Language name (c++, java, javascript)
 * @returns {number} Judge0 Language ID
 */
const getLanguageById = (lang) => {
    const languageMap = {
        "c++": 54,
        "java": 62,
        "javascript": 63
    };
    return languageMap[lang.toLowerCase()];
};

/**
 * Submits a batch of code snippets to Judge0 for execution.
 * @param {Array} submissions - List of submission objects (source_code, stdin, etc.)
 * @returns {Promise<Array>} List of submission tokens
 */
const submitbatch = async (submissions) => {
    const options = {
        method: 'POST',
        url: `https://${process.env.RAPIDAPI_HOST}/submissions/batch`,
        params: { base64_encoded: 'false' },
        headers: {
            'x-rapidapi-key': process.env.RAPIDAPI_KEY,
            'x-rapidapi-host': process.env.RAPIDAPI_HOST,
            'Content-Type': 'application/json'
        },
        data: { submissions }
    };
    const response = await axios.request(options);
    return response.data;
};

/**
 * Internal helper for polling delay.
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Polls Judge0 for results of a specific batch of tokens.
 * Retries every 1 second until all submissions are processed.
 * @param {Array} resultTokens - List of tokens returned by submitbatch
 * @returns {Promise<Array>} List of execution results (stdout, stderr, status, etc.)
 */
const submittoken = async (resultTokens) => {
    const options = {
        method: 'GET',
        url: `https://${process.env.RAPIDAPI_HOST}/submissions/batch`,
        params: {
            tokens: resultTokens.join(','),
            base64_encoded: 'false',
            fields: '*'
        },
        headers: {
            'x-rapidapi-key': process.env.RAPIDAPI_KEY,
            'x-rapidapi-host': process.env.RAPIDAPI_HOST
        }
    };

    while (true) {
        const response = await axios.request(options);
        const result = response.data;

        // Check if all submissions in the batch have finished processing (status > 2)
        const allFinished = result.submissions.every((s) => s.status.id > 2);

        if (allFinished) return result.submissions;

        // Wait before polling again to avoid rate limits
        await delay(1000);
    }
};

module.exports = { getLanguageById, submitbatch, submittoken };
