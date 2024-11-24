import { Router } from "express";
import { isPastille } from "../middlewares/isPastille";
import Setting from "@models/Setting";
import Logs from "@libs/Logs";

const router = Router();

router.post("/settings/add", isPastille, async (req, res) => {
  const { guild_id, premium, premium_end, options, moderation } = req.body;
  const { sharing, limit, imune, roles, sanctions } = moderation;
  const { low, medium, hight } = sanctions;

  try {
    const newSettingsRegistre = new Setting({
      guild_id: guild_id,
      premium: premium || false,
      premium_end: premium_end || null,
      options: {
        bang: options.bang || "!",
        color: options.color || "E7BB41",
        channels: {
          announce: options.channels.announce || "annonce",
          help: options.channels.help || "support",
          voiceText: options.channels.voiceText || "voix-avec-les-mains",
          screenshots: options.channels.screenshots || "screenshots",
        },
      },
      moderation: {
        sharing: sharing || false,
        channels: {
          alert: moderation.channels.alert || null,
          report: moderation.channels.report || null,
          automod: moderation.channels.automod || null,
        },
        limit: {
          emoji: limit.emoji || -1,
          mention: limit.mention || -1,
          link: limit.link || -1,
          invite: limit.invite || -1,
        },
        imune: imune || [],
        roles: {
          muted: roles.muted || null,
          rule: roles.rule || null,
          staff: roles.staff || null,
        },
        sanctions: {
          low: {
            duration: low.duration || 5,
            unit: low.unit || "m",
          },
          medium: {
            duration: medium.duration || 30,
            unit: medium.unit || "m",
          },
          hight: {
            duration: hight.duration || 1,
            unit: hight.unit || "h",
          },
        },
      },
    });
    await newSettingsRegistre.save();

    res
      .status(200)
      .json({ message: "New settings registred", data: newSettingsRegistre });
  } catch (error: any) {
    res.status(400).json({ message: "An error occured", error: error });
    Logs("api:settings:post", "error", error, guild_id);
  }
});

router.get("/settings", isPastille, async (req, res) => {
  const { guild_id } = req.query;

  try {
    const guildSettings = await Setting.findOne({
      guild_id: { $eq: guild_id },
    });

    if (!guildSettings) {
      res.status(404).json({ message: "No settings found" });
    } else {
      res.status(200).json({ message: "Settings found", data: guildSettings });
    }
  } catch (error: any) {
    res.status(400).json({ message: "An error occured", error: error });
    Logs("api:settings:get", "error", error, guild_id as string);
  }
});

export default router;
