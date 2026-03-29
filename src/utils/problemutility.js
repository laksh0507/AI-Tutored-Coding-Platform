const axios = require("axios");

const getLanguageById = (lang) => {
    const language = {
        "c++": 54,
        "java": 62,
        "javascript": 63
    }
    return language[lang.toLowerCase()];
}

const submitbatch = async (submissions) => {
    const options = {
        method: 'POST',
        url: `https://${process.env.RAPIDAPI_HOST}/submissions/batch`,
        params: {
            base64_encoded: 'false'
        },
        headers: {
            'x-rapidapi-key': process.env.RAPIDAPI_KEY,
            'x-rapidapi-host': process.env.RAPIDAPI_HOST,
            'Content-Type': 'application/json'
        },
        data: {
            submissions
        }
    };
    const response = await axios.request(options);
    return response.data;
}

const waiting = (timer) => {
    return new Promise((resolve) => setTimeout(resolve, timer));
}

const submittoken = async (resulttoken) => {
    const options = {
        method: 'GET',
        url: `https://${process.env.RAPIDAPI_HOST}/submissions/batch`,
        params: {
            tokens: resulttoken.join(','),
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

        const isresultobtained = result.submissions.every((r) => r.status.id > 2);

        if (isresultobtained) return result.submissions;

        await waiting(1000);
    }
}

module.exports = { getLanguageById, submitbatch, submittoken };
