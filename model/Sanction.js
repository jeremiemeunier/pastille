const mongoose = require("mongoose");

const sanction = mongoose.model("Sanction", {
    user_id: String,
    sanction: {
        level: String,
        duration: String,
        ending: Date
    }
});

module.exports = sanction;