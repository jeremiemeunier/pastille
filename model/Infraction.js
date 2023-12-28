const mongoose = require("mongoose");

const infraction = mongoose.model("Infraction", {
    user_id: String,
    guild_id: String,
    warn: {
        reason: String,
        date: String
    }
});

module.exports = infraction;