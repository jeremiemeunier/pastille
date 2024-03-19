const mongoose = require("mongoose");

const role = mongoose.model("Role", {
  guild_id: String,
  name: String,
  emote: String,
  role: String,
  description: String,
});

module.exports = role;
