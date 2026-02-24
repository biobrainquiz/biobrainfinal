const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");

router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // 1️⃣ Find user by email OR mobile
    const user = await User.findOne({
      $or: [
        { email: identifier },
        { mobile: identifier }
      ]
    });

    if (!user) {
      return res.json({
        success: false,
        message: "User not found!"
      });
    }

    // 2️⃣ Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({
        success: false,
        message: "Invalid password!"
      });
    }

    // 3️⃣ Success
    res.json({
      success: true,
      message: "Login successful!"
    });

  } catch (error) {
    res.json({
      success: false,
      message: "Server error!"
    });
  }
});

module.exports = router;