const mongoose = require("mongoose");

const streamer = mongoose.model("Streamer", {
  twitch: {
    id: String,
    name: String
  },
  message: String,
  progress: Boolean
});

module.exports = streamer;