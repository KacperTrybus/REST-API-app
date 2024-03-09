const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { userValidation } = require("./userValidation");
const authMiddleware = require("../auth");
const { User } = require("./userModel");
require("dotenv").config();

router.post("/signup", async (req, res) => {
  const { error } = userValidation.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const existingUser = await User.findOne({ email: req.body.email });
  if (existingUser) {
    return res.status(409).json({ message: "Email in use" });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  const newUser = new User({
    email: req.body.email,
    password: hashedPassword,
    subscription: "starter",
  });

  try {
    const savedUser = await newUser.save();
    res.status(201).json({ user: savedUser });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  const { error } = userValidation.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(401).json({ message: "Email or password is wrong" });
  }

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) {
    return res.status(401).json({ message: "Email or password is wrong" });
  }

  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
  user.token = token;
  await user.save();

  res.status(200).json({
    token,
    user: { email: user.email, subscription: user.subscription },
  });
});

router.get("/logout", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    user.token = null;
    await user.save();

    res.status(204).send();
  } catch (error) {
    console.error("Error logging out:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/current", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    res.status(200).json({
      email: user.email,
      subscription: user.subscription,
    });
  } catch (error) {
    console.error("Error fetching current user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
