import { Request, Response, Router } from "express";
import { isPastille } from "../middlewares/isPastille";
import Infraction from "@models/Infraction";
import Logs from "@libs/Logs";
import { rateLimiter } from "@libs/RateLimiter";

const router = Router();

router.post(
  "/infraction",
  isPastille,
  rateLimiter,
  async (req: Request, res: Response) => {
    const { user_id, reason, date, guild_id } = req.body;

    try {
      const q_make = new Infraction({
        user_id: user_id,
        guild_id: guild_id,
        warn: {
          reason: reason,
          date: date,
        },
      });
      await q_make.save();

      res.status(200).json({ message: "New infraction items created", data: q_make });
    } catch (err: any) {
      res.status(500).json({ message: "Internal server error", error: err });
      Logs("api:infraction:post", "error", err, guild_id);
    }
  }
);

router.get(
  "/infraction/all",
  isPastille,
  rateLimiter,
  async (req: Request, res: Response) => {
    const { user_id, guild_id } = req.query;

    try {
      const q_list = await Infraction.countDocuments({
        user_id: { $eq: user_id },
        guild_id: { $eq: guild_id },
      });
      res.status(200).json({ message: "Infractions find", count: q_list });
    } catch (err: any) {
      res.status(500).json({ message: "Internal server error", error: err });
      Logs("api:infraction:get:all", "error", err, guild_id as string);
    }
  }
);

export default router;
