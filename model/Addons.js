const mongoose = require("mongoose");

const addons = mongoose.model("Addons", {
  guild_id: String,
  name: String,
  active: Boolean,
  channel: String,
  params: {},
  role: String,
});

module.exports = addons;
