const mongoose = require("mongoose");

const setting = mongoose.model("Setting", {
    guild_id: String,
    premium: Boolean,
    premium_end: String,
    options: {
      bang: String,
      color: String,
      channels: {
        announce: String,
        help: String,
        voiceText: String,
        screenshots: String
      }
    },
    moderation: {
      sharing: Boolean,
      channels: {
        alert: String,
        report: String,
      },
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