const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const { connectDB } = require("./models/db");

async function start() {
  const db = await connectDB();
}

start();

const authRoutes = require("./routes/authRoutes");
const activityRoutes = require("./routes/activityRoutes");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/activity", activityRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Internal Server Error");
});

app.use(express.static(path.join(__dirname, "../frontend")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/public", "home.html"));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`Server running on port http://localhost:${PORT}`)
);
