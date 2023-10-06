const mongoose = require("mongoose");

const dailyui = mongoose.model("DailyUi", {
    state: Boolean,
    title: String,
    description: String
});

module.exports = dailyui;