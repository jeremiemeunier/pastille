import { Request, Response, Router } from "express";
import { isPastille } from "../middlewares/isPastille.middle";
import Infraction from "@models/Infraction.model";
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

      res.status(201).json(q_make);
    } catch (err: any) {
      res.status(500).json({ message: "Internal server error", error: err });
      Logs({
        node: ["api", "infraction", "post"],
        state: "error",
        content: err,
        details: guild_id as string,
      });
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
      res.status(200).json(q_list);
    } catch (err: any) {
      res.status(500).json({ message: "Internal server error", error: err });
      Logs({
        node: ["api", "infraction", "get", "all"],
        state: "error",
        content: err,
        details: guild_id as string,
      });
    }
  }
);

export default router;
