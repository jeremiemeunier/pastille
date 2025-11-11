import { Request, Response, Router } from "express";
import { isPastille } from "../middlewares/isPastille";
import Setting from "@models/Setting.model";
import Logs from "@libs/Logs";
import { rateLimiter } from "@libs/RateLimiter";

const router = Router();

router.post(
  "/settings/add",
  isPastille,
  rateLimiter,
  async (req: Request, res: Response) => {
    const { guild_id, premium, premium_end, options, moderation } = req.body;
    const { sharing, limit, imune, roles, sanctions } = moderation;
    const { low, medium, hight } = sanctions;

    try {
      const q_make = new Setting({
        guild_id: guild_id,
        premium: premium || false,
        premium_end: premium_end || null,
        options: {
          bang: options.bang || "!",
          color: options.color !== "" || "E7BB41",
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
      await q_make.save();

      res.status(201).json(q_make);
    } catch (err: any) {
      res.status(500).json({ message: "Internal server error", error: err });
      Logs(["api", "settings", "post"], "error", err, guild_id);
    }
  }
);

router.get(
  "/settings",
  isPastille,
  rateLimiter,
  async (req: Request, res: Response) => {
    const { guild_id } = req.query;

    try {
      const q_get = await Setting.findOne({
        guild_id: { $eq: guild_id },
      });

      if (q_get) {
        res.status(200).json(q_get);
        return;
      }
      res.status(404).json({ message: "No settings found" });
    } catch (err: any) {
      res.status(500).json({ message: "Internal server error", error: err });
      Logs(["api", "settings", "get"], "error", err, guild_id as string);
    }
  }
);

export default router;
