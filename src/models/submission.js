const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const submissionSchema = new Schema({
    userid: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    problemid: {
        type: Schema.Types.ObjectId,
        ref: "Problem",
        required: true
    },
    code: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'wrong', 'error'],
        default: 'pending'
    },
    language: {
        type: String,
        enum: ['c++', 'java', 'javascript'],
        required: true
    },
    runtime: {
        type: Number,
        default: 0
    },
    memory: {
        type: Number,
        default: 0
    },
    errorMessage: {
        type: String,
        default: ''
    },
    testcasespassed: {
        type: Number,
        default: 0
    },
    testcasestotal: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const Submission = mongoose.model("Submission", submissionSchema);
module.exports = Submission;