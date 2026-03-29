const mongoose = require("mongoose");
const { Schema } = mongoose;

const problemschema = new Schema({
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
        type: String,  // Changed to array for multiple tags
        enum: ['array', 'linkedlist', 'trees', 'dp'],
        required: true,
    },
    visibletestcases: [{
        input: {
            type: String,
            required: true
        },
        output: {
            type: String,
            required: true
        },
        explanation: {
            type: String,
            required: true
        }
    }],
    hiddentestcases: [{
        input: {
            type: String,
            required: true
        },
        output: {
            type: String,
            required: true
        }
    }],
    startcode: [{
        language: {
            type: String,
            required: true,
            enum: ['c++', 'java', 'javascript']
        },
        initialcode: {
            type: String,
            required: true
        }
    }],

    // ✅ FIXED: Proper schema definition
    referencesolution: [{
        language: {
            type: String,
            required: true,
            enum: ['c++', 'java', 'javascript'] // Add more as needed
        },
        completecode: {
            type: String,
            required: true
        }
    }],

    hint1: {
        type: String,
        required: true
    },
    hint2: {
        type: String,
        required: true
    },

    problemcreator: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }

}, {
    timestamps: true  // Adds createdAt and updatedAt automatically
});

const Problem = mongoose.model("problem", problemschema);
module.exports = Problem;