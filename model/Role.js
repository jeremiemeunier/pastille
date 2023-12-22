const mongoose = require("mongoose");

const role = mongoose.model("Role", {
  guid_id: String,
  name: String,
  emote: String,
  role: String,
  description: String
});

module.exports = role;