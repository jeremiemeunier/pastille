const mongoose = require("mongoose");

const streamer = mongoose.model("Streamer", {
  guild_id: String,
  twitch: {
    id: String,
    name: String
  },
  message: String,
  progress: Boolean
});

module.exports = streamer;