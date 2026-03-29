const Problem = require("../models/problem");
const HintUsage = require("../models/hintusage");
const model = require("../config/gemini");

const gethint = async (req, res) => {
    try {
        const userid = req.result._id;
        const problemid = req.params.id.trim();

        const problem = await Problem.findById(problemid);
        if (!problem) return res.status(404).send("problem not found");

        // Find or create hint usage record for this user-problem pair
        let hintrecord = await HintUsage.findOne({ userid, problemid });
        if (!hintrecord) {
            hintrecord = await HintUsage.create({ userid, problemid, currenthintlevel: 0 });
        }

        const level = hintrecord.currenthintlevel;

        if (level === 0) {
            // Hint 1: First basic text hint
            hintrecord.currenthintlevel = 1;
            await hintrecord.save();
            return res.status(200).json({ hint: 1, content: problem.hint1 });
        }
        else if (level === 1) {
            // Hint 2: Second basic text hint
            hintrecord.currenthintlevel = 2;
            await hintrecord.save();
            return res.status(200).json({ hint: 2, content: problem.hint2 });
        }
        else if (level === 2) {
            // Hint 3: AI Q&A — tell user to send POST /hint/ai/:id
            return res.status(200).json({
                hint: 3,
                message: "Send POST to /hint/ai/" + problemid + " with your code and doubt in the body",
                format: { code: "your code here", doubt: "your question here" }
            });
        }
        else if (level === 3) {
            // Hint 4: Full solution (legacy support if any users are at level 3)
            hintrecord.currenthintlevel = 4;
            await hintrecord.save();
            return res.status(200).json({ hint: 4, content: problem.referencesolution });
        }
        else if (level === 4) {
            // User reached the end. Tell the frontend they are at level 4.
            return res.status(200).json({ hint: 4, message: "All hints have been used. You can view the solution." });
        }
        else {
            return res.status(200).json({ message: "All hints have been used" });
        }
    }
    catch (err) {
        res.status(500).send("error: " + err.message);
    }
};

const aihint = async (req, res) => {
    try {
        const userid = req.result._id;
        const problemid = req.params.id.trim();
        const { code, doubt } = req.body;

        if (!code || !doubt) return res.status(400).send("code and doubt are required");

        const problem = await Problem.findById(problemid);
        if (!problem) return res.status(404).send("problem not found");

        // Check if user is at level 2 (AI hint level)
        const hintrecord = await HintUsage.findOne({ userid, problemid });
        if (!hintrecord || hintrecord.currenthintlevel !== 2) {
            return res.status(403).send("You must unlock hint 1 and hint 2 first before using AI hint");
        }

        // Build the prompt with anti-cheat instructions
        const prompt = `You are a coding tutor. The user is solving this problem:

Title: ${problem.title}
Description: ${problem.description}

The user's code:
${code}

The user's doubt:
${doubt}

STRICT RULES (NO EXCEPTIONS):
- NEVER give the complete solution or full working code.
- NEVER write code that directly solves the problem or any significant part of it.
- DO NOT provide pseudocode that is too close to the actual code.
- If the user explicitly asks for the full code, answer, or solution, you MUST politely refuse and explain that your role is to help them learn, not to do the work for them.
- Your goal is to provide tiny nudges and identify errors in the user's logic.
- You can provide small (max 2-3 lines) illustrative code snippets only to explain a general programming concept, but NEVER specific to the solution of this problem.
- Be encouraging, but remain firm on not giving the answer.
- If you provide a full solution, you have failed your mission as a tutor.
- Keep your response concise and focused on the user's current doubt.`;

        const result = await model.generateContent(prompt);
        const response = result.response.text();

        res.status(200).json({ hint: 3, airesponse: response });
    }
    catch (err) {
        res.status(500).send("error: " + err.message);
    }
};

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

        // Advance to max level and return solution
        hintrecord.currenthintlevel = 4;
        await hintrecord.save();

        return res.status(200).json({ hint: 4, content: problem.referencesolution });
    }
    catch (err) {
        res.status(500).send("error: " + err.message);
    }
};

module.exports = { gethint, aihint, getfullsolution };
