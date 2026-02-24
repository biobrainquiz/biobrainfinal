const fs = require("fs");
const path = require("path");
const Question = require("../models/Question");

async function autoSeed() {
  try {
    const count = await Question.countDocuments();

    if (count > 0) {
      console.log("✅ MCQs already exist. Skipping seeding.");
      return;
    }

    console.log("⚡ No MCQs found. Seeding database...");

    const filePath = path.join(__dirname, "../quiz_data/gate_zoology.json");
    const questions = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    await Question.insertMany(questions);

    console.log("🔥 MCQs seeded successfully!");
  } catch (err) {
    console.error("❌ Auto seeding failed:", err);
  }
}

module.exports = autoSeed;