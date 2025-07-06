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
      const newInfraction = new Infraction({
        user_id: user_id,
        guild_id: guild_id,
        warn: {
          reason: reason,
          date: date,
        },
      });
      await newInfraction.save();

      res
        .status(200)
        .json({ message: "New infraction items created", data: newInfraction });
    } catch (err: any) {
      res.status(500).end();
      Logs("api:infraction:post", "error", err, guild_id);
    }
  }
);

router.get(
  "/infraction/all",
  isPastille,
  async (req: Request, res: Response) => {
    const { user_id, guild_id } = req.query;

    try {
      const allInfractions = await Infraction.countDocuments({
        user_id: { $eq: user_id },
        guild_id: { $eq: guild_id },
      });
      res
        .status(200)
        .json({ message: "Infractions find", count: allInfractions });
    } catch (err: any) {
      res.status(500).end();
      Logs("api:infraction:get:all", "error", err, guild_id as string);
    }
  }
);

export default router;
