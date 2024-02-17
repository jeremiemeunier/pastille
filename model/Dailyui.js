const mongoose = require("mongoose");

const dailyui = mongoose.model("DailyUi", {
  guild_id: String,
  available: Boolean,
  title: String,
  description: String,
});

module.exports = dailyui;
