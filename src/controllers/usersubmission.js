/**
 * @file usersubmission.js
 * @description Controllers for Code Submission and Execution.
 * Handles running code against visible test cases and submitting against hidden test cases using Judge0.
 */

const Problem = require("../models/problem");
const Submission = require("../models/submission");
const { getLanguageById, submitbatch, submittoken } = require("../utils/problemutility");

/**
 * Submits user code for final evaluation against hidden test cases.
 * Updates submission status and user's solved problems list on success.
 * @route POST /submit/:id
 */
const submitcode = async (req, res) => {
    try {
        const userid = req.result._id;
        const problemid = req.params.id.trim();
        const { code, language } = req.body;

        if (!userid || !code || !problemid || !language) {
            return res.status(400).send("some field missing");
        }

        const foundProblem = await Problem.findById(problemid);
        if (!foundProblem) return res.status(404).send("problem not found");

        // Initialize submission record
        const submittedresult = await Submission.create({
            userid,
            problemid,
            code,
            language,
            testcasespassed: 0,
            status: "pending",
            testcasestotal: foundProblem.hiddentestcases.length,
            errorMessage: "",
            runtime: 0
        });

        const languageId = getLanguageById(language);
        const submissions = foundProblem.hiddentestcases.map((testcase) => ({
            source_code: code,
            language_id: languageId,
            stdin: testcase.input,
            expected_output: testcase.output
        }));
        
        // Batch execute test cases via Judge0
        const submitresult = await submitbatch(submissions);
        const resultoken = submitresult.map((value) => value.token);
        const testresult = await submittoken(resultoken);

        let testcasespassed = 0;
        let runtime = 0;
        let memory = 0;
        let status = "accepted";
        let errorMessage = " ";

        // Aggregate results from all test cases
        for (const test of testresult) {
            if (test.status_id === 3) {
                testcasespassed++;
                runtime += parseFloat(test.time);
                memory = Math.max(memory, test.memory);
            }
            else {
                status = (test.status_id === 4) ? "error" : "wrong";
                errorMessage = test.stderr || "Execution failed";
            }
        }
    
        // Update record with final results
        submittedresult.status = status;
        submittedresult.testcasespassed = testcasespassed;
        submittedresult.errorMessage = errorMessage;
        submittedresult.runtime = runtime;
        submittedresult.memory = memory;

        await submittedresult.save();

        // If accepted and first time solving, update user's solved list
        if (status === "accepted" && !req.result.problemsolved.includes(problemid)) {
            req.result.problemsolved.push(problemid);
            await req.result.save();
        }

        res.status(201).send(submittedresult);
    }
    catch (err) {
        res.status(500).send("there is an error: " + err.message);
    }
}

/**
 * Runs user code against visible test cases for immediate feedback.
 * @route POST /submit/run/:id
 */
const runcode = async (req, res) => {
     try {
        const userid = req.result._id;
        const problemid = req.params.id.trim();
        const { code, language } = req.body;

        if (!userid || !code || !problemid || !language) {
            return res.status(400).send("some field missing");
        }

        const foundProblem = await Problem.findById(problemid);
        if (!foundProblem) return res.status(404).send("problem not found");

        const languageId = getLanguageById(language);
        const submissions = foundProblem.visibletestcases.map((testcase) => ({
                source_code: code,
                language_id: languageId,
                stdin: testcase.input,
                expected_output: testcase.output
        }));
        
        const submitresult = await submitbatch(submissions);
        const resultoken = submitresult.map((value) => value.token);
        const testresult = await submittoken(resultoken);

        res.status(201).send(testresult);
    }
    catch (err) {
        res.status(500).send("there is an error: " + err.message);
    }
}

module.exports = { submitcode, runcode };