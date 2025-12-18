const User = require("../models/user");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
require("dotenv").config();

// Gmail transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "No account found with this email" });
    }

    const secret = process.env.JWT_SECRET + user.password;

    const token = jwt.sign({ id: user._id, email: user.email }, secret, {
      expiresIn: "15m",
    });

    const resetURL = `${process.env.FRONTEND_URL}/reset-password?token=${token}&id=${user._id}`;

    const html = `
  <div style="
    font-family: Arial, Helvetica, sans-serif;
    max-width: 600px;
    margin: 0;
    padding: 20px;
    line-height: 1.6;
    text-align: left;
  ">

    <h2 style="color: #2c3e50; margin-top: 0;">
      SMA Traders – Password Reset Request
    </h2>

    <p>Hello,</p>

    <p>
      We received a request to reset the password for your
      <strong>SMA Traders</strong> account.
      If you initiated this request, please use the link below to set a new password.
    </p>

    <div style="margin: 20px 0; text-align: left;">
      <a href="${resetURL}"
        style="
          background-color: #1e8449;
          color: #ffffff;
          padding: 12px 18px;
          text-decoration: none;
          border-radius: 6px;
          display: inline-block;
          font-weight: bold;
        ">
        Reset Password
      </a>
    </div>

    <p>
      This password reset link will expire in
      <strong>15 minutes</strong> for security reasons.
    </p>

    <p>
      If you did not request a password reset, you can safely ignore this email.
      Your account will remain secure.
    </p>

    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 24px 0;" />

    <p style="font-size: 13px; color: #7f8c8d;">
      Regards,<br />
      <strong>SMA Traders Support Team</strong>
    </p>

  </div>
`;

    // Send email using Nodemailer
    await transporter.sendMail({
      from: `"SMA Traders" <${process.env.GMAIL_USER}>`,
      to: user.email,
      subject: "Password Reset Request",
      html,
    });

    res.status(200).json({
      message: "Password reset link sent successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to process reset request",
      error: error.message,
    });
  }
};

module.exports = { requestPasswordReset };
