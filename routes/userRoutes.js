const express = require("express");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();

const User = require("../models/user");
const { requestPasswordReset } = require("../controllers/requestPasswordb");
const { resetPassword } = require("../controllers/resetPassword");


router.post("/signup", async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "User Already Exists" });
    }

    user = new User({ email, password });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    const payload = {
      user: {
        id: user._id,
      },
    };

    jwt.sign(payload, "randomString", { expiresIn: "1h" }, (err, token) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Error generating token");
      }
      res.status(201).json({
        message: "SignUp successfully",
        token,
        user: { _id: user._id, email: user.email },
      });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error in Saving");
  }
});

router.post("/login", async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
    });
  }

  const { email, password } = req.body;
  try {
    let user = await User.findOne({
      email,
    });
    if (!user)
      return res.status(400).json({
        message: "User not found Please Signup",
      });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({
        message: "Incorrect Password",
      });

    const payload = {
      user: {
        id: user._id,
      },
    };

    jwt.sign(payload, "randomString", { expiresIn: "1h" }, (err, token) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Error generating token");
      }
      res.status(201).json({
        message: "Login successfully",
        token,
        user: { _id: user._id, email: user.email },
      });
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      message: "Server Error",
    });
  }
});

router.post('/requestPasswordReset', requestPasswordReset);
router.post('/resetPassword/:id/:token', resetPassword);

module.exports = router;
