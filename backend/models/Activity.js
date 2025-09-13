const mongoose = require("mongoose");

const ActivitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  activity: String,
  co2: Number,
  category: String,
  date: String,
});

module.exports = mongoose.model("Activity", ActivitySchema);
