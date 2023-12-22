const mongoose = require("mongoose");

const setting = mongoose.model("Setting", {
    guild_id: String,
    options: {
      bang: String,
      color: String,
      reaction: {
        rule: String,
        ticket: String,
        announce: String,
        warn: String
      },
      channels: {
        console: String,
        debug: String,
        announce: String,
        help: String,
        voiceText: String,
        screenshots: String
      }
    },
    moderation: {
      automod: Boolean,
      limit: {
        emoji: Number,
        mention: Number,
        link: Number,
        invite: Number
      },
      imune: Array,
      roles: {
        muted: String,
        rule: String
      },
      sanctions: {
        low: {
          duration: Number,
          unit: String
        },
        medium: {
          duration: Number,
          unit: String
        },
        hight: {
          duration: Number,
          unit: String
        },
        critical: {
          duration: Number,
          unit: String
        }
      }
    }
});

module.exports = setting;