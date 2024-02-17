const mongoose = require("mongoose");

const emote = mongoose.model("Emote", {
  letter: String,
  emote: String,
});

module.exports = emote;
