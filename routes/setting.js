const express = require("express");
const router = express.Router();
const Setting = require("../model/Setting");
const isPastille = require("../middlewares/isPastille");
const { logs } = require("../function/logs");

router.post("/settings/add", isPastille, async (req, res) => {
  const { guild_id, premium, premium_end, options, moderation } = req.body;
  const { channels } = options;
  const { sharing, limit, immune, roles, sanctions } = moderation;
  const { low, medium, hight, critical } = sanctions;

  try {
    const newSettingsRegistre = new Setting({
      guild_id: guild_id,
      premium: premium || false,
      premium_end: premium_end || null,
      options: {
        bang: options.bang || "!",
        color: options.color || "#57CC99",
        channels: {
          announce: channels.announce || "annonce",
          help: channels.help || "support",
          voiceText: channels.voiceText || "voix-avec-les-mains",
          screenshots: channels.screenshots || "screenshots"
        }
      },
      moderation: {
        sharing: sharing || false,
        limit: {
          emoji: limit.emoji || -1,
          mention: limit.mention || -1,
          link: limit.link || -1,
          invite: limit.invite || -1
        },
        imune: immune || [],
        roles: {
          muted: roles.muted || null,
          rule: roles.rule || null
        },
        sanctions: {
          low: {
            duration: low.duration || 5,
            unit: low.unit || "m"
          },
          medium: {
            duration: medium.duration || 30,
            unit: medium.unit || "m"
          },
          hight: {
            duration: hight.duration || 1,
            unit: hight.unit || "h"
          },
          critical: {
            duration: critical.duration || 1,
            unit: critical.unit || "d"
          }
        }
      }
    });
    await newSettingsRegistre.save();

    res.status(200).json({ message: "New settings registred", data: newSettingsRegistre });
  }
  catch(error) {
    logs("error", "api:guild_settings:post", error);
    res.status(400).json({ error: error });
  }
});

router.get("/settings", isPastille, async (req, res) => {
  const { guild_id } = req.query;

  try {
    const guildSettings = await Setting.findOne({ guild_id: guild_id });
    
    if(!guildSettings) { res.status(404).json({ message: "No settings found" }); }
    else { res.status(200).json({ message: "Settings found", data: guildSettings }); }
  }
  catch(error) {
    logs("error", "api:guild_settings:get", error);
    res.status(400).json({ error: error });
  }
});

module.exports = router;