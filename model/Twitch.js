const mongoose = require("mongoose");

const twitch = mongoose.model("Twitch", {
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