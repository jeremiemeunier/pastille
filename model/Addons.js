const mongoose = require("mongoose");

const addon = mongoose.model("Addon", {
  guid_id: String,
  name: String,
  active: Boolean,
  channel: String,
  role: String,
  delay: String
});

module.exports = addon;