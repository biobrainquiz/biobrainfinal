require("dotenv").config();

const {autoSeed} = require("./utils/autoSeeder");
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const useragent = require("express-useragent");
const path = require("path");

const app = express();

/* ==============================
   Environment Detection
============================== */

const isProduction = process.env.PRODUCTION === "true";

process.env.MONGO_URI = isProduction
  ? process.env.PRODUCTION_SERVER_MONGO_URI
  : process.env.LOCAL_SERVER_MONGO_URI;

process.env.BASE_URI = isProduction
  ? process.env.PRODUCTION_SERVER_BASE_URI
  : process.env.LOCAL_SERVER_BASE_URI;

const mongoURI = process.env.MONGO_URI;

/* ==============================
   MongoDB Connection
============================== */

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ Connected to MongoDB");
    await autoSeed();   // 🔥 THIS LINE

  })
  .catch((err) => console.log("❌ MongoDB connection error:", err));

/*mongoose
  .connect(mongoURI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.log("❌ MongoDB connection error:", err));*/

/* ==============================
   Session Middleware
============================== */

app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecretkey",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: mongoURI,
    }),
    cookie: {
      maxAge: 15 * 60 * 1000, // 15 minutes
    },
  })
);

/* ==============================
   Cache Control
============================== */

app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

/* ==============================
   Make Session Available to EJS
============================== */

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

/* ==============================
   Extend Session on Activity
============================== */

app.use((req, res, next) => {
  if (req.session.user) {
    req.session.touch();
  }
  next();
});

/* ==============================
   View Engine Setup
============================== */

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

/* ==============================
   General Middleware
============================== */

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(useragent.express());

/* ==============================
   Device Detection
============================== */

function getDevice(req) {
  if (req.useragent.isMobile) return "mobile";
  if (req.useragent.isTablet) return "tablet";
  return "desktop";
}

/* ==============================
   Models
============================== */

const Quiz = require("./models/Question");

/* ==============================
   Page Routes
============================== */

app.get("/", (req, res) => {
  const device = getDevice(req);
  res.render(`pages/${device}/index`);
});

app.get("/about", (req, res) => {
  const device = getDevice(req);
  res.render(`pages/${device}/about`);
});

app.get("/login", (req, res) => {
  const device = getDevice(req);
  res.render(`pages/${device}/login`);
});

app.get("/register", (req, res) => {
  const device = getDevice(req);
  res.render(`pages/${device}/register`);
});

app.get("/forgot", (req, res) => {
  const device = getDevice(req);
  res.render(`pages/${device}/forgot`);
});

/* ==============================
   🔥 Dynamic Quiz Page Route
   Example:
   /quiz?numQuestions=10&difficulty=medium
============================== */

app.get("/quiz", async (req, res) => {
  try {
    const device = getDevice(req);

    const difficulty = req.query.difficulty || "hard";

    const all = await Quiz.find();
    const questions = await Quiz.aggregate([
      { $match: { difficulty_level: difficulty, category: "gate" } },
      { $sample: { size: 20 } }
    ]);

    res.render(`pages/${device}/quiz`, { questions });

  } catch (err) {
    console.error("Quiz load error:", err);
    res.status(500).send("Error loading quiz");
  }
});

/*app.get("/quiz", async (req, res) => {
  try {
    const device = getDevice(req);

    const numQuestions = parseInt(req.query.numQuestions) || 10;
    const difficulty = req.query.difficulty || "easy";

    const questions = await Quiz.aggregate([
      { $match: { difficulty_level: difficulty, category: "gate" } },
      { $sample: { size: numQuestions } }
    ]);

    res.render(`pages/${device}/quiz`, { questions });

  } catch (err) {
    console.error("Quiz load error:", err);
    res.status(500).send("Error loading quiz");
  }
});*/

app.get("/leaderboard", (req, res) => {
  const device = getDevice(req);
  res.render(`pages/${device}/leaderboard`);
});

app.get("/quizzes", (req, res) => {
  const device = getDevice(req);
  res.render(`pages/${device}/quizzes`);
});

app.get("/profile", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  const device = getDevice(req);
  res.render(`pages/${device}/profile`);
});

/* ==============================
   Logout
============================== */

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log("Logout error:", err);
      return res.redirect("/");
    }
    res.clearCookie("connect.sid");
    res.redirect("/");
  });
});

/* ==============================
   Footer Pages
============================== */

app.get("/disclaimer", (req, res) => {
  const device = getDevice(req);
  res.render(`pages/${device}/disclaimer`);
});

app.get("/privacy", (req, res) => {
  const device = getDevice(req);
  res.render(`pages/${device}/privacy`);
});

app.get("/terms", (req, res) => {
  const device = getDevice(req);
  res.render(`pages/${device}/terms`);
});

/* ==============================
   API Routes
============================== */

app.use("/", require("./routes/reset"));
app.use("/api", require("./routes/register"));
app.use("/api", require("./routes/login"));
app.use("/api", require("./routes/forgot"));
app.use("/api/quiz", require("./routes/quiz"));


/* ==============================
   404
============================== */

app.use((req, res) => {
  res.status(404).render("404");
});

/* ==============================
   Start Server
============================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);