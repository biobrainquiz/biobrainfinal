const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../models/User");

router.post("/forgot", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found!" });
    }

    // 1️⃣ Generate secure token
    const token = crypto.randomBytes(32).toString("hex");

    // 2️⃣ Hash token before saving
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // 3️⃣ Save hashed token + expiry
    user.resetPasswordToken = hashedToken;

    // Convert minutes (string) → number → milliseconds
    const expiryMinutes = Number(process.env.EMAIL_EXPIRY_IN_MIN) || 10;
    user.resetPasswordExpires =
      Date.now() + expiryMinutes * 60 * 1000;

    await user.save();

    // 4️⃣ Send email
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS
      }
    });

    const resetURL = `${process.env.BASE_URL}/reset/${token}`;

    await transporter.sendMail({
      to: user.email,
      subject: "Reset Your BioBrain Password",
      text: `
              Reset Your BioBrain Password

              We received a request to reset your password.

              Click the link below:
              ${resetURL}

              This link will expire in ${process.env.EMAIL_EXPIRY_IN_MIN} minutes.

              If you did not request this, please ignore this email.`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 40px;">
          <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">

          <h2 style="color: #2c3e50; margin-bottom: 20px;">Reset Your Password</h2>

          <p style="font-size: 16px; color: #555;">
            Hello ${user.username} !!!
          </p>

          <p style="font-size: 16px; color: #555;">
            We received a request to reset your BioBrain account password.
            Click the button below to set a new password.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetURL}"
               style="background-color: #007bff; color: #ffffff; padding: 12px 25px;
                      text-decoration: none; border-radius: 5px; font-size: 16px;
                      display: inline-block;">
              Reset Password
            </a>
          </div>

          <p style="font-size: 14px; color: #888;">
            This link will expire in  ${process.env.EMAIL_EXPIRY_IN_MIN} minutes for security reasons.
          </p>

          <p style="font-size: 14px; color: #888;">
            If you did not request a password reset, please ignore this email.
            Your account remains secure.
          </p>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">

          <p style="font-size: 13px; color: #aaa; text-align: center;">
            © ${new Date().getFullYear()} BioBrain. All rights reserved.
          </p>
        </div>
      </div>
      `
    });

    res.json({ success: true, message: "Reset link sent to email!" });

  } catch (err) {
    res.json({ success: false, message: "Server error!" + err.message });
  }
});

module.exports = router;