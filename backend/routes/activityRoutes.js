const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("../models/db");

const router = express.Router();

const activitySchema = new mongoose.Schema({
  userId: String,
  activity: String,
  co2: Number,
  category: String,
  date: String,
});

const Activity = mongoose.model("Activity", activitySchema);

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.sendStatus(401);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    res.sendStatus(403);
  }
}

router.post("/add", authMiddleware, async (req, res) => {
  const { activity, co2, category, date } = req.body;
  try {
    const newActivity = new Activity({
      userId: req.userId,
      activity,
      co2,
      category,
      date,
    });
    await newActivity.save();
    res.status(201).json({ message: "Activity saved" });
  } catch {
    res.status(500).json({ message: "Error saving activity" });
  }
});

router.get("/my", authMiddleware, async (req, res) => {
  try {
    const logs = await Activity.find({ userId: req.userId });
    const total = logs.reduce((sum, a) => sum + a.co2, 0);
    res.json({ logs, total });
  } catch {
    res.status(500).json({ message: "Error fetching logs" });
  }
});

router.get("/weekly-summary", authMiddleware, async (req, res) => {
  try {
    const now = new Date();
    const pastWeek = new Date();
    pastWeek.setDate(now.getDate() - 7);

    const logs = await Activity.find({
      userId: req.userId,
      date: { $gte: pastWeek.toISOString().split("T")[0] },
    });

    const daily = {};
    logs.forEach(({ date, co2 }) => {
      daily[date] = (daily[date] || 0) + co2;
    });

    res.json({ daily });
  } catch {
    res.status(500).json({ message: "Error getting summary" });
  }
});

router.get("/average-emissions", async (req, res) => {
  try {
    const allLogs = await Activity.find();
    const userMap = {};
    allLogs.forEach(({ userId, co2 }) => {
      userMap[userId] = (userMap[userId] || 0) + co2;
    });
    const values = Object.values(userMap);
    const avg = values.reduce((a, b) => a + b, 0) / values.length || 0;
    res.json({ average: avg.toFixed(2) });
  } catch {
    res.status(500).json({ message: "Error calculating average" });
  }
});

router.get("/leaderboard", async (req, res) => {
  try {
    const allLogs = await Activity.find();
    const userMap = {};

    allLogs.forEach(({ userId, co2 }) => {
      userMap[userId] = (userMap[userId] || 0) + co2;
    });

    const sorted = Object.entries(userMap)
      .sort((a, b) => a[1] - b[1])
      .slice(0, 10);

    res.json({
      leaderboard: sorted.map(([userId, total]) => ({
        userId,
        total: total.toFixed(2),
      })),
    });
  } catch {
    res.status(500).json({ message: "Error building leaderboard" });
  }
});

module.exports = router;
