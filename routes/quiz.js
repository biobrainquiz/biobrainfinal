const express = require("express");
const router = express.Router();
const Question = require("../models/Question");

// ================= START QUIZ =================
router.post("/start", async (req, res) => {
    try {
        const { numberOfQuestions, difficulty } = req.body;
        const questions = await Question.aggregate([
            { $sample: { size: parseInt(numberOfQuestions) } }
        ]);

        const timeLimit = parseInt(numberOfQuestions);

        res.json({ questions, timeLimit });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error" });
    }
});


// ================= SUBMIT QUIZ =================
router.post("/submit", async (req, res) => {
    try {
        const { answers, questions } = req.body;
        let score = 0;
        let correct = 0;
        let wrong = 0;

        questions.forEach(q => {
            const userAns = answers[q._id]; // may be undefined if not attempted

            if (userAns) {
                if (userAns == q.answer) {
                    score += q.marks;
                    correct++;
                } else {
                    wrong++;
                }
            }
        });

        const totalQuestions = questions.length;
        const attempted = Object.keys(answers).length;

        res.render("pages/desktop/quizresults", {
            totalQuestions,
            attempted,
            correct,
            wrong,
            score,
            questions: questions,
            userAnswers: answers,
            user: req.session.user
        });

    } catch (err) {
        console.error(err);
        res.status(500).send("Submission error");
    }
});

module.exports = router;