const fs = require("fs");
const path = require("path");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const multer = require("multer");
const jimp = require("jimp");
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
  const avatar = gravatar.url(req.body.email, { s: "250", r: "pg", d: "mp" });

  const newUser = new User({
    email: req.body.email,
    password: hashedPassword,
    subscription: "starter",
    avatarURL: avatar,
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

  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  user.token = token;
  await user.save();

  res.status(200).json({
    token,
    user: { email: user.email, subscription: user.subscription },
  });
});

router.get("/logout", authMiddleware, async (req, res) => {
  try {
    await User.findOneAndUpdate(
      { _id: req.user._id },
      { $set: { token: null } }
    );

    res.status(204).send();
  } catch (error) {
    console.error("Error logging out:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/current", authMiddleware, async (req, res) => {
  try {
    const { user } = req;

    res.status(200).json({
      email: user.email,
      subscription: user.subscription,
    });
  } catch (error) {
    console.error("Error fetching current user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

const upload = multer({ dest: "tmp/" });

router.patch(
  "/avatars",
  authMiddleware,
  upload.single("avatar"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const image = await jimp.read(req.file.path);
      await image.resize(250, 250).write(req.file.path);

      const avatarFileName = `${req.user._id.toString()}_${Date.now()}${path.extname(
        req.file.originalname
      )}`;
      const avatarPath = `public/avatars/${avatarFileName}`;
      fs.renameSync(req.file.path, avatarPath);

      req.user.avatarURL = `/avatars/${avatarFileName}`;
      await req.user.save();

      res.status(200).json({ avatarURL: req.user.avatarURL });
    } catch (error) {
      console.error("Error updating avatar:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

module.exports = router;
