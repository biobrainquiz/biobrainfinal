const express = require("express");
const router = express.Router();
const Question = require("../models/Question");

// ================= START QUIZ =================
router.post("/quiz/start", async (req, res) => {
    try {
        const { numberOfQuestions, difficulty } = req.body;
        const questions = await Question.aggregate([
            { $sample: { size: parseInt(numberOfQuestions) } }
        ]);

        /*    const questions = await Question.aggregate([
              {
                $match: {
                  category: "gate",
                  difficulty_level: difficulty
                }
              },
              { $sample: { size: parseInt(numberOfQuestions) } }
            ]);*/

        const timeLimit = parseInt(numberOfQuestions);

        res.json({ questions, timeLimit });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error" });
    }
});

// ================= SUBMIT QUIZ =================
router.post("/quiz/submit", async (req, res) => {
     try {
        const { answers } = req.body;
        let score = 0;

        for (let qid in answers) {
            const question = await Question.findById(qid);
            if (question && question.answer === answers[qid]) {
                score += question.marks;
            }
        }

        res.json({ score });

    } catch (err) {
        res.status(500).json({ error: "quiz.js:Submission Error" });
    }
});

module.exports = router;