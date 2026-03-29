/**
 * @file userproblem.js
 * @description Controllers for Problem Management.
 * Handles creation, retrieval, updates, and deletion of coding problems,
 * including integration with the Judge0 execution engine for test case validation.
 */

const { getLanguageById, submitbatch, submittoken } = require("../utils/problemutility");
const Problem = require("../models/problem");
const User = require("../models/user");
const Submission = require("../models/submission");
const redisclient = require("../config/redis");

/**
 * Creates a new coding problem.
 * Validates the reference solution against provided test cases before saving.
 * @route POST /problem/create
 */
const createproblem = async (req, res) => {
    const { visibletestcases, referencesolution } = req.body;
    try {
        // Validate each reference solution against visible test cases via Judge0
        for (const { language, completecode } of referencesolution) {
            const languageId = getLanguageById(language);
            
            const submissions = visibletestcases.map((testcase) => ({
                source_code: completecode,
                language_id: languageId,
                stdin: testcase.input,
                expected_output: testcase.output
            }));

            const submitresult = await submitbatch(submissions);
            const resultoken = submitresult.map((value) => value.token);
            const testresult = await submittoken(resultoken);
            
            for (const test of testresult) {
                if (test.status_id != 3) {
                    return res.status(400).send("error occured: reference solution failed validation");
                }
            }
        }

        // Save validated problem to database
        await Problem.create({
            ...req.body,
            problemcreator: req.result._id
        });
        
        res.status(201).send("problem saved");
    }
    catch (err) {
        res.status(400).send("Error: " + err);
    }
}

/**
 * Updates an existing problem.
 * Re-validates the solution if test cases or code are updated.
 * @route PUT /problem/update/:id
 */
const updateproblem = async (req, res) => {
    const { id } = req.params;
    const { visibletestcases, referencesolution } = req.body;
    
    try {
        for (const { language, completecode } of referencesolution) {
            const languageId = getLanguageById(language);
            
            const submissions = visibletestcases.map((testcase) => ({
                source_code: completecode,
                language_id: languageId,
                stdin: testcase.input,
                expected_output: testcase.output
            }));

            const submitresult = await submitbatch(submissions);
            const resulttoken = submitresult.map((value) => value.token);
            const testresult = await submittoken(resulttoken);
            
            for (const test of testresult) {
                if (test.status_id != 3) {
                    return res.status(400).send("error occured: reference solution failed validation");
                }
            }
        }

        if (!id) return res.status(500).send("missing id field");

        const dsaproblem = await Problem.findById(id);
        if(!dsaproblem) return res.status(500).send("id is not present in server");

        const newproblem = await Problem.findByIdAndUpdate(id, { ...req.body }, { runValidators: true, new: true });
        res.status(200).send(newproblem);
    } catch (err) {
        res.status(500).send("error:" + err.message);
    }
}

/**
 * Deletes a problem from the database.
 * @route DELETE /problem/delete/:id
 */
const deleteproblem = async (req, res) => {
    const { id } = req.params;
    try {
        if (!id) return res.status(400).send("ID is missing");
        
        const deletedproblem = await Problem.findByIdAndDelete(id);
        if (!deletedproblem) return res.status(404).send("problem is missing");

        res.status(200).send("successfully deleted");
    }
    catch (err) {
        res.status(500).send("error: " + err);
    }
}

/**
 * Retrieves a single problem by ID.
 * Implements Redis caching for high performance.
 * @route GET /problem/problembyid/:id
 */
const getproblembyid = async (req, res) => {
    const { id } = req.params;
    try {
        if (!id) return res.status(400).send("ID is invalid");

        // Attempt to fetch from Redis cache
        const cached = await redisclient.get(`problem:${id}`);
        if (cached) return res.status(200).send(JSON.parse(cached));

        // Fallback to MongoDB
        const ans = await Problem.findById(id);
        if (!ans) return res.status(404).send("problem is missing"); 

        // Update cache for subsequent requests
        await redisclient.setEx(`problem:${id}`, 3600, JSON.stringify(ans));

        res.status(200).send(ans);
    }
    catch (err) {
        res.status(400).send("error:" + err.message);
    }
}

/**
 * Retrieves all problems from the database.
 * @route GET /problem/getallproblem
 */
const getallproblem = async (req, res) => {
    try {
        const ans = await Problem.find({});
        if (ans.length === 0) return res.status(404).send("no problems found"); 
        res.status(200).send(ans);
    }
    catch (err) {
        res.status(400).send("error:" + err.message);
    }
}

/**
 * Fetches all problems solved by the currently authenticated user.
 * @route GET /problem/problemsolvedbyuser
 */
const solvedallproblembyuser = async (req, res) => {
    try {
        const userid = req.result._id;
        const foundUser = await User.findById(userid).populate({
            path: "problemsolved",
            select: "_id title difficulty tags"
        });
        res.status(200).send(foundUser.problemsolved);
    }
    catch (err) {
        return res.status(500).send("server error");
    }
}

/**
 * Retrieves all submissions made by the user for a specific problem.
 * @route GET /problem/submittedproblem/:id
 */
const submittedproblem = async (req, res) => {
    try {
        const userid = req.result._id;
        const problemid = req.params.id;
        const ans = await Submission.find({ userid, problemid });
        if (ans.length === 0) return res.status(200).send("no submission is present");
        res.status(200).send(ans);
    }
    catch (err) {
        res.status(500).send("internal server error");
    }
}

module.exports = { createproblem, updateproblem, deleteproblem, getproblembyid, getallproblem, solvedallproblembyuser, submittedproblem };