const mongoose = require("mongoose");

const quizResultSchema = new mongoose.Schema({
  sno: { type: Number }, // Serial number
  examdate: { type: String },
  examtime: { type: String },
  username: { type: String, required: true },
  exam: { type: String, required: true },
  subject: { type: String, required: true },
  noq: { type: Number, required: true }, // number of questions
  attempted: { type: Number, required: true },
  right: { type: Number, required: true },
  wrong: { type: Number, required: true },
  score: { type: Number, required: true }
});

module.exports = mongoose.model("QuizResult", quizResultSchema);