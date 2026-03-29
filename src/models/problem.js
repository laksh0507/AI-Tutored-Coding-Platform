/**
 * @file problem.js
 * @description Mongoose schema for Coding Problems.
 * Defines problem metadata, test cases, starting code, and AI hint content.
 */

const mongoose = require("mongoose");
const { Schema } = mongoose;

const problemSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    level: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        required: true
    },
    tags: {
        type: String,
        enum: ['array', 'linkedlist', 'trees', 'dp'],
        required: true,
    },
    visibletestcases: [{
        input: { type: String, required: true },
        output: { type: String, required: true },
        explanation: { type: String, required: true }
    }],
    hiddentestcases: [{
        input: { type: String, required: true },
        output: { type: String, required: true }
    }],
    startcode: [{
        language: {
            type: String,
            required: true,
            enum: ['c++', 'java', 'javascript']
        },
        initialcode: { type: String, required: true }
    }],
    referencesolution: [{
        language: {
            type: String,
            required: true,
            enum: ['c++', 'java', 'javascript']
        },
        completecode: { type: String, required: true }
    }],
    hint1: { type: String, required: true },
    hint2: { type: String, required: true },
    problemcreator: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, {
    timestamps: true
});

const Problem = mongoose.model("problem", problemSchema);
module.exports = Problem;