const mongoose = require("mongoose");

const infraction = mongoose.model("Infraction", {
    user_id: String,
    warns: Array
});

module.exports = infraction;