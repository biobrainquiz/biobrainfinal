require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const useragent = require("express-useragent");
const path = require("path");

const app = express();

/* ==============================
   MongoDB Connection
============================== */

const mongoURI = process.env.MONGO_URI;

mongoose
  .connect(mongoURI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.log("❌ MongoDB connection error:", err));

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
   Prevent Back Button After Logout
============================== */

app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
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
   Device Detection Function
============================== */

function getDevice(req) {
  if (req.useragent.isMobile) return "mobile";
  if (req.useragent.isTablet) return "tablet";
  return "desktop";
}

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

app.get("/quiz", (req, res) => {
  const device = getDevice(req);
  res.render(`pages/${device}/quiz`);
});

app.get("/leaderboard", (req, res) => {
  const device = getDevice(req);
  res.render(`pages/${device}/leaderboard`);
});

app.get("/quizzes", (req, res) => {
  const device = getDevice(req);
  res.render(`pages/${device}/quizzes`);
});

/* ==============================
   Logout Route
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

app.get("/profile", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  const device = getDevice(req);
  res.render(`pages/${device}/profile`);
});

/* ==============================
   API Routes
============================== */

const registerRoute = require("./routes/register");
app.use("/api", registerRoute);

const loginRoute = require("./routes/login");
app.use("/api", loginRoute);

const forgotRoute = require("./routes/forgot");
app.use("/api", forgotRoute);

const resetRoute = require("./routes/reset");
app.use("/", resetRoute);

/* ==============================
   Start Server
============================== */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);