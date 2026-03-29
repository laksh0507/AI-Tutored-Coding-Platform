const mongoose = require("mongoose");
const { Schema } = mongoose;

const hintusageSchema = new Schema({
    userid: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    problemid: {
        type: Schema.Types.ObjectId,
        ref: "problem",
        required: true
    },
    currenthintlevel: {
        type: Number,
        default: 0,
        min: 0,
        max: 4
    }
}, {
    timestamps: true
});

hintusageSchema.index({ userid: 1, problemid: 1 }, { unique: true });

const HintUsage = mongoose.model("HintUsage", hintusageSchema);
module.exports = HintUsage;