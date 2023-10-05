const mongoose = require("mongoose");

const moderation = mongoose.model("Moderation", {
    user_id: String,
    warns: Array,
    sanctions: Array
});

module.exports = moderation;