const mongoose = require("mongoose");

const command = mongoose.model("Command", {
  guild_id: String,
  terms: String,
  response: String,
});

module.exports = command;
