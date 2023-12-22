const mongoose = require("mongoose");

const addons = mongoose.model("Addons", {
  guid_id: String,
  name: String,
  active: Boolean,
  channel: String,
  role: String,
  delay: String
});

module.exports = addons;