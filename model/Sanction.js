const mongoose = require("mongoose");

const sanction = mongoose.model("Sanction", {
  user_id: String,
  guild_id: String,
  sanction: {
    level: String,
    date: String,
    ending: String,
  },
  checkable: Boolean,
});

module.exports = sanction;
