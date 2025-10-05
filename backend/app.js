const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
require("./models/db");

const authRoutes = require("./routes/authRoutes");
const activityRoutes = require("./routes/activityRoutes");
const pinoLogger = require("./logger.js");

dotenv.config();

const app = express();

//app.use(pinoHttp({ logger }));

app.use(cors());
//app.use("*", cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/activity", activityRoutes);
const pinoHttp = require("pino-http");
const logger = require("./logger.js");

//app.use(pinoHttp({ logger }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Internal Server Error");
});

app.get("/", (req, res) => {
  res.send("Inside the server");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`Server running on port http://localhost:${PORT}`)
);
