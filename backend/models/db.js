const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const url = process.env.MONGO_URL;
console.log("EEEEEEEEEEEEEEEEEEEEE", process.env.MONGO_URI);

mongoose.connect(url, {
  dbName: "footprintloggerdb",
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB using Mongoose");
});

module.exports = mongoose;
