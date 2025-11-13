import { Request, Response, Router } from "express";
import { isPastille } from "../middlewares/isPastille";
import Logs from "@libs/Logs";
import { rateLimiter } from "@libs/RateLimiter";
import Guild from "@models/Guild.model";
import SettingModel from "@models/Setting.model";
import { isAuthenticated } from "@middlewares/isAuthenticated";
import GuildModel from "@models/Guild.model";
import cachedDiscordAxios from "@utils/CachedDiscordAxios.utils";
import User from "@models/User.model";

const router = Router();

router.get(
  "/guild/:id",
  rateLimiter,
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      // First verify the user has access to this guild
      const user = await User.findById(req.user?.user_id);
      if (!user) {
        res.status(401).json({ message: "User not found" });
        return;
      }

      // Check if user has access to this guild
      const userGuilds = await cachedDiscordAxios.get("/users/@me/guilds", {
        headers: {
          Authorization: `${user.credentials.token_type} ${user.credentials.token}`,
        },
        userId: user.discord_id,
      });
      const hasAccess = userGuilds.data.some(
        (g: any) => g.id === req.params.id
      );
      if (!hasAccess) {
        res.status(403).json({ message: "Access denied" });
        return;
      }

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
      // First verify the user has access to this guild
      const user = await User.findById(req.user?.user_id);
      if (!user) {
        res.status(401).json({ message: "User not found" });
        return;
      }

      // Check if user has access to this guild
      const userGuilds = await cachedDiscordAxios.get("/users/@me/guilds", {
        headers: {
          Authorization: `${user.credentials.token_type} ${user.credentials.token}`,
        },
        userId: user.discord_id,
      });
      const hasAccess = userGuilds.data.some(
        (g: any) => g.id === req.params.id
      );
      if (!hasAccess) {
        res.status(403).json({ message: "Access denied" });
        return;
      }

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
      // First verify the user has access to this guild
      const user = await User.findById(req.user?.user_id);
      if (!user) {
        res.status(401).json({ message: "User not found" });
        return;
      }

      // Check if user has access to this guild
      const userGuilds = await cachedDiscordAxios.get("/users/@me/guilds", {
        headers: {
          Authorization: `${user.credentials.token_type} ${user.credentials.token}`,
        },
        userId: user.discord_id,
      });
      const hasAccess = userGuilds.data.some(
        (g: any) => g.id === req.params.id
      );
      if (!hasAccess) {
        res.status(403).json({ message: "Access denied" });
        return;
      }

      // Validate guild ID: must be 17-19 digits (Discord snowflake)
      if (!/^\d{17,19}$/.test(req.params.id)) {
        res.status(400).json({ error: "Invalid guild ID format" });
        return;
      }

      const response = await cachedDiscordAxios.get(
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

router.get(
  "/guild/:id/roles",
  rateLimiter,
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      // First verify the user has access to this guild
      const user = await User.findById(req.user?.user_id);
      if (!user) {
        res.status(401).json({ message: "User not found" });
        return;
      }

      // Check if user has access to this guild
      const userGuilds = await cachedDiscordAxios.get("/users/@me/guilds", {
        headers: {
          Authorization: `${user.credentials.token_type} ${user.credentials.token}`,
        },
        userId: user.discord_id,
      });
      const hasAccess = userGuilds.data.some(
        (g: any) => g.id === req.params.id
      );
      if (!hasAccess) {
        res.status(403).json({ message: "Access denied" });
        return;
      }

      // Validate guild ID: must be 17-19 digits (Discord snowflake)
      if (!/^\d{17,19}$/.test(req.params.id)) {
        res.status(400).json({ error: "Invalid guild ID format" });
        return;
      }

      const response = await cachedDiscordAxios.get(
        `https://discord.com/api/v10/guilds/${req.params.id}/roles`,
        {
          headers: {
            Authorization: `Bot ${process.env.BOT_TOKEN}`,
          },
        }
      );

      res.status(200).json(response.data);
      return;
    } catch (err: any) {
      Logs(["api", "guild", "roles"], "error", err);

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
      // First verify the user has access to this guild
      const user = await User.findById(req.user?.user_id);
      if (!user) {
        res.status(401).json({ message: "User not found" });
        return;
      }

      // Check if user has access to this guild
      const userGuilds = await cachedDiscordAxios.get("/users/@me/guilds", {
        headers: {
          Authorization: `${user.credentials.token_type} ${user.credentials.token}`,
        },
        userId: user.discord_id,
      });
      const hasAccess = userGuilds.data.some(
        (g: any) => g.id === req.params.id
      );
      if (!hasAccess) {
        res.status(403).json({ message: "Access denied" });
        return;
      }

      // Only allow specific fields to be updated
      const allowedFields = [
        "options.bang",
        "options.color",
        "options.channels.announce",
        "options.channels.help",
        "options.channels.voiceText",
        "options.channels.screenshots",
        "moderation.sharing",
        "moderation.channels.alert",
        "moderation.channels.report",
        "moderation.channels.automod",
        "moderation.limit.emoji",
        "moderation.limit.mention",
        "moderation.limit.link",
        "moderation.limit.invite",
        "moderation.imune",
        "moderation.roles.muted",
        "moderation.roles.rule",
        "moderation.roles.staff",
        "moderation.sanctions.low.duration",
        "moderation.sanctions.low.unit",
        "moderation.sanctions.medium.duration",
        "moderation.sanctions.medium.unit",
        "moderation.sanctions.hight.duration",
        "moderation.sanctions.hight.unit",
      ];

      // Build updates object with only allowed fields
      const updates: any = {};
      const flattenObject = (obj: any, prefix = ""): void => {
        for (const key in obj) {
          const fullKey = prefix ? `${prefix}.${key}` : key;
          if (
            typeof obj[key] === "object" &&
            obj[key] !== null &&
            !Array.isArray(obj[key])
          ) {
            flattenObject(obj[key], fullKey);
          } else if (allowedFields.includes(fullKey)) {
            updates[fullKey] = obj[key];
          }
        }
      };
      flattenObject(req.body);

      if (Object.keys(updates).length === 0) {
        res.status(400).json({ error: "No valid fields to update" });
        return;
      }

      const q_update = await SettingModel.updateOne(
        { guild_id: { $eq: req.params.id } },
        { $set: updates }
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
