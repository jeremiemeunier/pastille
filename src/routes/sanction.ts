import { Request, Response, Router } from "express";
import { isPastille } from "../middlewares/isPastille";
import Sanction from "@models/Sanction";
import Logs from "@libs/Logs";
import { rateLimiter } from "@libs/RateLimiter";

const router = Router();

router.put(
  "/sanction/update",
  isPastille,
  rateLimiter,
  async (req: Request, res: Response) => {
    const { id } = req.query;

    if (!id || typeof id !== "string") {
      res.status(400).json({ message: "Invalid Id provided" });
      return;
    }

    try {
      const q_update = await Sanction.findByIdAndUpdate(
        id,
        { checkable: false },
        { new: true }
      );
      res.status(200).json({ data: q_update });
    } catch (err: any) {
      res.status(500).json({ message: "Internal server error", error: err });
      Logs("api:sanction:put", "error", err);
    }
  }
);

router.post(
  "/sanction/add",
  isPastille,
  rateLimiter,
  async (req: Request, res: Response) => {
    const { user_id, level, date, end, guild_id } = req.body;

    try {
      const q_make = new Sanction({
        user_id: user_id,
        guild_id: guild_id,
        sanction: {
          level: level,
          date: date,
          ending: end,
        },
        checkable: true,
      });
      await q_make.save();

      res.status(200).json({ message: "New sanction items created", data: q_make });
    } catch (err: any) {
      res.status(500).json({ message: "Internal server error", error: err });
      Logs("api:sanction:register:post", "error", err, guild_id);
    }
  }
);

router.get(
  "/sanction",
  isPastille,
  rateLimiter,
  async (req: Request, res: Response) => {
    const { guild_id } = req.query;

    try {
      const q_list = await Sanction.find({
        guild_id: { $eq: guild_id },
        checkable: true,
      });
      res.status(200).json({ message: "Sanction find", data: q_list });
    } catch (err: any) {
      res.status(500).json({ message: "Internal server error", error: err });
      Logs("api:sanction:get:all", "error", err, guild_id as string);
    }
  }
);

export default router;
