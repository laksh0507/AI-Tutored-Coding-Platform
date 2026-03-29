/**
 * @file userhint.js
 * @description Controllers for the AI-powered Hint System.
 * Handles hint unlocking levels and AI interaction via Gemini.
 */

const Problem = require("../models/problem");
const HintUsage = require("../models/hintusage");
const geminiModel = require("../config/gemini");

/**
 * Unlocks or retrieves a hint level for a specific problem.
 * @route GET /hint/:id
 */
const gethint = async (req, res) => {
    try {
        const userid = req.result._id;
        const problemid = req.params.id.trim();

        const problem = await Problem.findById(problemid);
        if (!problem) return res.status(404).send("problem not found");

        let hintrecord = await HintUsage.findOne({ userid, problemid });
        if (!hintrecord) {
            hintrecord = await HintUsage.create({ userid, problemid, currenthintlevel: 0 });
        }

        const level = hintrecord.currenthintlevel;

        // Level 0: First Conceptual Hint
        if (level === 0) {
            hintrecord.currenthintlevel = 1;
            await hintrecord.save();
            return res.status(200).json({ hint: 1, content: problem.hint1 });
        }
        // Level 1: Second Logical Hint
        else if (level === 1) {
            hintrecord.currenthintlevel = 2;
            await hintrecord.save();
            return res.status(200).json({ hint: 2, content: problem.hint2 });
        }
        // Level 2: Unlocks AI Q&A Capability
        else if (level === 2) {
            return res.status(200).json({
                hint: 3,
                message: "Send POST to /hint/ai/" + problemid + " with your code and doubt in the body",
                format: { code: "your code here", doubt: "your question here" }
            });
        }
        // Level 4: Full solution view
        else if (level === 4) {
            return res.status(200).json({ hint: 4, message: "All hints used. You can view the solution." });
        }
        else {
            return res.status(200).json({ message: "All hints have been used" });
        }
    }
    catch (err) {
        res.status(500).send("error: " + err.message);
    }
};

/**
 * Handles interactive AI tutoring for the problem.
 * Requires Level 2 hint status.
 * @route POST /hint/ai/:id
 */
const aihint = async (req, res) => {
    try {
        const userid = req.result._id;
        const problemid = req.params.id.trim();
        const { code, doubt } = req.body;

        if (!code || !doubt) return res.status(400).send("code and doubt are required");

        const problem = await Problem.findById(problemid);
        if (!problem) return res.status(404).send("problem not found");

        const hintrecord = await HintUsage.findOne({ userid, problemid });
        if (!hintrecord || hintrecord.currenthintlevel !== 2) {
            return res.status(403).send("You must unlock hint 1 and hint 2 first before using AI hint");
        }

        const prompt = `You are a coding tutor. The user is solving this problem:
Title: ${problem.title}
Description: ${problem.description}
User's code: ${code}
User's doubt: ${doubt}

STRICT RULES (NO EXCEPTIONS):
- NEVER give the complete solution or full working code.
- NEVER write code that directly solves the problem.
- DO NOT provide pseudocode that is too close to the actual code.
- Your goal is to provide tiny nudges and identify errors in logic.
- You can provide small (max 2-3 lines) illustrative code snippets only to explain a general concept.
- If you provide a full solution, you have failed your mission as a tutor.`;

        const result = await geminiModel.generateContent(prompt);
        const response = result.response.text();

        res.status(200).json({ hint: 3, airesponse: response });
    }
    catch (err) {
        res.status(500).send("error: " + err.message);
    }
};

/**
 * Unlocks the full reference solution.
 * Requires sequential unlocking of previous levels.
 * @route GET /hint/solution/:id
 */
const getfullsolution = async (req, res) => {
    try {
        const userid = req.result._id;
        const problemid = req.params.id.trim();

        const problem = await Problem.findById(problemid);
        if (!problem) return res.status(404).send("problem not found");

        let hintrecord = await HintUsage.findOne({ userid, problemid });
        if (!hintrecord || hintrecord.currenthintlevel < 2) {
            return res.status(403).send("You must unlock all previous hints sequentially before viewing the solution.");
        }

        hintrecord.currenthintlevel = 4;
        await hintrecord.save();

        return res.status(200).json({ hint: 4, content: problem.referencesolution });
    }
    catch (err) {
        res.status(500).send("error: " + err.message);
    }
};

module.exports = { gethint, aihint, getfullsolution };
