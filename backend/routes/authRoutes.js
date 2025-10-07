const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { connectDB } = require("../models/db");

const router = express.Router();

let usersCollection;

(async () => {
  try {
    const db = await connectDB();
    usersCollection = db.collection("users");
  } catch (err) {
    console.error("Failed to initialize DB in auth route:", err);
  }
})();

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!usersCollection)
    return res.status(500).json({ message: "DB not ready" });

  try {
    const existing = await usersCollection.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already in use" });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = {
      username,
      email,
      password: hashed,
    };

    await usersCollection.insertOne(newUser);
    res.status(201).json({ message: "User registered" });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!usersCollection)
    return res.status(500).json({ message: "DB not ready" });

  try {
    const user = await usersCollection.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ token, username: user.username });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
