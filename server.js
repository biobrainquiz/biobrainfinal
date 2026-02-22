const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const useragent = require("express-useragent");
const path = require("path");

require("dotenv").config();
const app = express();

// Set EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(useragent.express());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Function to detect device type
function getDevice(req) {
  if (req.useragent.isMobile) return "mobile";
  if (req.useragent.isTablet) return "tablet";
  return "desktop";
}

// Dynamic routes for all pages
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


// ===== MongoDB Atlas connection =====
//const mongoURI ="mongodb://biobrain_user:biobrain@cluster0-shard-00-00.abcd.mongodb.net:27017,cluster0-shard-00-01.abcd.mongodb.net:27017,cluster0-shard-00-02.abcd.mongodb.net:27017/biobrain?ssl=true&replicaSet=atlas-xxxx-shard-0&authSource=admin&retryWrites=true&w=majority"
//const mongoURI = "mongodb+srv://biobrain_user:biobrain@cluster0.abcd.mongodb.net/biobrain?retryWrites=true&w=majority";
//const mongoURI = "mongodb://127.0.0.1:27017/biobrain"

const mongoURI = process.env.MANGO_URI;
mongoose.connect(mongoURI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch(err => console.log("MongoDB connection error:", err));

// TODO: Add API routes for login/register/forgot password
const registerRoute = require("./routes/register");
app.use("/api", registerRoute); // Register route

const loginRoute = require("./routes/login");
app.use("/api", loginRoute); // login route

const forgotRoute = require("./routes/forgot");
app.use("/api", forgotRoute); // fotgot route

const resetRoute = require("./routes/reset");
app.use("/", resetRoute); // reset route

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));