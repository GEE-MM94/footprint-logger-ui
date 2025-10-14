const express = require("express");
const jwt = require("jsonwebtoken");
const { connectDB } = require("../models/db");

const router = express.Router();

let activitiesCollection;

(async () => {
  try {
    const db = await connectDB();
    activitiesCollection = db.collection("activities");
  } catch (err) {
    console.error("Failed to connect to DB in activity route:", err);
  }
})();

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.sendStatus(401);
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "defaultsecret"
    );
    req.userId = decoded.userId;
    next();
  } catch {
    res.sendStatus(403);
  }
}

router.post("/activities/add", authMiddleware, async (req, res) => {
  const { activity, co2, category, date } = req.body;

  if (!activity || typeof co2 !== "number" || !category || !date) {
    return res.status(400).json({ message: "Invalid input data." });
  }

  if (!activitiesCollection)
    return res.status(500).json({ message: "DB not ready" });

  try {
    const newActivity = {
      userId: req.userId,
      activity,
      co2,
      category,
      date,
    };
    await activitiesCollection.insertOne(newActivity);
    res.status(201).json({ message: "Activity saved" });
  } catch (err) {
    console.error("Error saving activity:", err);
    res.status(500).json({ message: "Error saving activity" });
  }
});

router.get("/activities/my", authMiddleware, async (req, res) => {
  if (!activitiesCollection)
    return res.status(500).json({ message: "DB not ready" });

  try {
    const logs = await activitiesCollection
      .find({ userId: req.userId })
      .toArray();
    const total = logs.reduce((sum, a) => sum + a.co2, 0);
    res.json({ logs, total: total.toFixed(2) });
  } catch (err) {
    console.error("Error fetching logs:", err);
    res.status(500).json({ message: "Error fetching logs" });
  }
});

router.get("/activities/weekly-summary", authMiddleware, async (req, res) => {
  if (!activitiesCollection)
    return res.status(500).json({ message: "DB not ready" });

  try {
    const now = new Date();
    const pastWeek = new Date();
    pastWeek.setDate(now.getDate() - 7);

    const logs = await activitiesCollection
      .find({
        userId: req.userId,
        date: { $gte: pastWeek.toISOString().split("T")[0] },
      })
      .toArray();

    const daily = {};
    logs.forEach(({ date, co2 }) => {
      daily[date] = (daily[date] || 0) + co2;
    });

    res.json({ daily });
  } catch (err) {
    console.error("Error getting summary:", err);
    res.status(500).json({ message: "Error getting summary" });
  }
});

router.get("/activities/average-emissions", async (req, res) => {
  if (!activitiesCollection)
    return res.status(500).json({ message: "DB not ready" });

  try {
    const allLogs = await activitiesCollection.find().toArray();

    const userMap = {};
    allLogs.forEach(({ userId, co2 }) => {
      userMap[userId] = (userMap[userId] || 0) + co2;
    });

    const values = Object.values(userMap);
    const avg = values.reduce((a, b) => a + b, 0) / values.length || 0;

    res.json({ average: avg.toFixed(2) });
  } catch (err) {
    console.error("Error calculating average:", err);
    res.status(500).json({ message: "Error calculating average" });
  }
});

router.get("/activities/leaderboard", async (req, res) => {
  if (!activitiesCollection)
    return res.status(500).json({ message: "DB not ready" });

  try {
    const allLogs = await activitiesCollection.find().toArray();

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
  } catch (err) {
    console.error("Error building leaderboard:", err);
    res.status(500).json({ message: "Error building leaderboard" });
  }
});

const defaultActivityData = {
  "car travel": 2.3,
  "meat consumption": 5.0,
  "electricity use": 1.2,
};

const activityCategories = {
  "car travel": "transport",
  "meat consumption": "food",
  "electricity use": "energy",
};

router.get("/activity-types", (req, res) => {
  res.json({ types: Object.keys(defaultActivityData) });
});

router.get("/activity-categories", (req, res) => {
  res.json({ categories: activityCategories });
});

module.exports = router;
