// utils/populateQuestions.js

require("dotenv").config();
const { MongoClient } = require("mongodb");
const questions = require("../quiz_data/gate_zoology.json"); // your JSON file with 50 questions

async function populateDB() {
  const client = new MongoClient(process.env.PRODUCTION_SERVER_MONGO_URI); // or your Mongo URI
  try {
    await client.connect();
    const db = client.db("biobrain");
    const collection = db.collection("mcqs");

    const result = await collection.insertMany(questions);
    console.log(`Inserted ${result.insertedCount} questions successfully!`);
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

populateDB();