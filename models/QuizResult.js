const mongoose = require("mongoose");

const quizResultSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    exam: String,
    subject: String,
    score: Number,
    totalQuestions: Number,
    accuracy: Number
}, { timestamps: true });

module.exports = mongoose.model("QuizResult", quizResultSchema);