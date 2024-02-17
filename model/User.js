const mongoose = require("mongoose");

const user = mongoose.model("User", {
  discord_id: String,
  password: String,
  mail_adress: String,
  token: String,
  sign_date: String,
});

module.exports = user;
