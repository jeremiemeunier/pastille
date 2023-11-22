const mongoose = require("mongoose");

const twitch = mongoose.model("Twitchping", {
  discord: {
    id: String,
    name: String
  },
  twitch: {
    id: String,
    name: String
  },
  progress: Boolean
});

module.exports = twitch;