import { Request, Response, Router } from "express";
import { isPastille } from "../middlewares/isPastille";
import Logs from "@libs/Logs";
import { rateLimiter } from "@libs/RateLimiter";
import Guild from "@models/Guild.model";
import SettingModel from "@models/Setting.model";
import { isAuthenticated } from "@middlewares/isAuthenticated";
import GuildModel from "@models/Guild.model";

const router = Router();

router.get(
  "/guild/:id",
  rateLimiter,
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const q_get = await GuildModel.findOne({
        id: { $eq: req.params.id },
      });

      if (!q_get) {
        res.status(404).json({ message: "Guild not found" });
        return;
      }

      res.status(200).json(q_get);
      return;
    } catch (err: any) {
      Logs(["api", "guild"], "error", err);
      res.status(500).json({ error: "Internal server error" });
      return;
    }
  }
);

router.get(
  "/guild/:id/settings",
  rateLimiter,
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const q_get = await SettingModel.findOne({
        guild_id: { $eq: req.params.id },
      });

      if (!q_get) {
        res.status(404).json({ message: "Guild setting not found" });
        return;
      }

      res.status(200).json(q_get);
      return;
    } catch (err: any) {
      Logs(["api", "guild", "settings"], "error", err);
      res.status(500).json({ error: "Internal server error" });
      return;
    }
  }
);

router.get(
  "/guild/:id/channels",
  rateLimiter,
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      // Validate guild ID: must be 17-19 digits (Discord snowflake)
      if (!/^\d{17,19}$/.test(req.params.id)) {
        res.status(400).json({ error: "Invalid guild ID format" });
        return;
      }
      const axios = require("axios");
      const response = await axios.get(
        `https://discord.com/api/v10/guilds/${req.params.id}/channels`,
        {
          headers: {
            Authorization: `Bot ${process.env.BOT_TOKEN}`,
          },
        }
      );

      res.status(200).json(response.data.filter((ch: any) => ch.type === 0));
      return;
    } catch (err: any) {
      Logs(["api", "guild", "channels"], "error", err);

      if (err.response?.status === 404) {
        res.status(404).json({ message: "Guild not found" });
        return;
      }

      if (err.response?.status === 403) {
        res
          .status(403)
          .json({ message: "Bot does not have access to this guild" });
        return;
      }

      res.status(500).json({ error: "Internal server error" });
      return;
    }
  }
);

router.patch(
  "/guild/:id/settings",
  rateLimiter,
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const q_update = await SettingModel.updateOne(
        { guild_id: { $eq: req.params.id } },
        { $set: req.body }
      );

      if (q_update.matchedCount === 0) {
        res.status(404).json({ message: "Guild setting not found" });
        return;
      }

      res.status(204).send();
      return;
    } catch (err: any) {
      Logs(["api", "guild", "settings", "update"], "error", err);
      res.status(500).json({ error: "Internal server error" });
      return;
    }
  }
);

router.post(
  "/guild/join",
  isPastille,
  rateLimiter,
  async (req: Request, res: Response) => {
    try {
      const q_exist = await Guild.findOne({ id: { $eq: req.body.id } });

      if (q_exist) {
        try {
          await Guild.updateOne(
            { id: { $eq: req.body.id } },
            { $set: { data: req.body } }
          );
          res.status(409).json({ message: "Guild already exists" });
          return;
        } catch (err: any) {
          Logs(["api", "guild", "update"], "error", err);
          res.status(409).json({ message: "Guild already exists" });
          return;
        }
      }

      const q_make = new Guild({
        id: req.body.id,
        data: req.body,
      });
      await q_make.save();

      res.status(201).json({ message: "Guild added successfully" });
      return;
    } catch (err: any) {
      Logs(["api", "guild", "join"], "error", err);
      res.status(500).json({ error: "Internal server error" });
      return;
    }
  }
);

export default router;
