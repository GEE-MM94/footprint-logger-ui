const router = require("express").Router();
const Activity = require("../models/Activity");
const User = require("../models/User");
const auth = require("../middleware/auth");

router.get("/me", auth, async (req, res) => {
  const activities = await Activity.find({ user: req.user.id });
  const total = activities.reduce((sum, a) => sum + a.co2, 0);
  res.json({ activities, total });
});

router.post("/", auth, async (req, res) => {
  const newActivity = new Activity({ ...req.body, user: req.user.id });
  await newActivity.save();
  res.json(newActivity);
});

router.get("/summary", auth, async (req, res) => {
  const today = new Date();
  const pastWeek = new Date(today);
  pastWeek.setDate(today.getDate() - 6);
  const data = await Activity.find({ user: req.user.id });
  const summary = Array(7)
    .fill(0)
    .map((_, i) => {
      const date = new Date(pastWeek);
      date.setDate(pastWeek.getDate() + i);
      const day = date.toISOString().split("T")[0];
      const total = data
        .filter((a) => a.date === day)
        .reduce((sum, a) => sum + a.co2, 0);
      return { date: day, total };
    });
  res.json(summary);
});

router.get("/leaderboard", async (req, res) => {
  const users = await User.find();
  const scores = await Promise.all(
    users.map(async (u) => {
      const logs = await Activity.find({ user: u._id });
      const total = logs.reduce((sum, a) => sum + a.co2, 0);
      return { username: u.username, total };
    })
  );
  const sorted = scores.sort((a, b) => a.total - b.total).slice(0, 10);
  res.json(sorted);
});

router.get("/average", async (req, res) => {
  const logs = await Activity.find();
  const totals = {};
  const counts = {};
  logs.forEach((a) => {
    if (!totals[a.user]) {
      totals[a.user] = 0;
      counts[a.user] = 0;
    }
    totals[a.user] += a.co2;
    counts[a.user]++;
  });
  const totalUsers = Object.keys(totals).length;
  const totalSum = Object.values(totals).reduce((a, b) => a + b, 0);
  res.json({ average: (totalSum / totalUsers).toFixed(2) });
});

module.exports = router;
