const mongoose = require("mongoose");

const rule = mongoose.model("Rule", {
  guild_id: String,
  name: String,
  description: String,
  active: Boolean,
});

module.exports = rule;