const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { connectDB } = require("../models/db");

const router = express.Router();
let usersCollection;

connectDB().then((db) => {
  usersCollection = db.collection("users");
});

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!usersCollection)
    return res.status(500).json({ message: "DB not ready" });

  const existing = await usersCollection.findOne({ email });
  if (existing)
    return res.status(400).json({ message: "Email already in use" });

  const hashed = await bcrypt.hash(password, 10);
  const result = await usersCollection.insertOne({
    username,
    email,
    password: hashed,
  });

  const token = jwt.sign(
    { userId: result.insertedId },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.status(201).json({ token, username });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!usersCollection)
    return res.status(500).json({ message: "DB not ready" });

  const user = await usersCollection.findOne({ email });
  if (!user) return res.status(400).json({ message: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  res.json({ token, username: user.username });
});

module.exports = router;
