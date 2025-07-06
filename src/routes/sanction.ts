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

    try {
      const updateSanction = await Sanction.findByIdAndUpdate(
        { _id: { $eq: id } },
        { checkable: false }
      );
      res.status(200).json({ data: updateSanction });
    } catch (err: any) {
      res.status(500).end();
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
      const newSanction = new Sanction({
        user_id: user_id,
        guild_id: guild_id,
        sanction: {
          level: level,
          date: date,
          ending: end,
        },
        checkable: true,
      });
      await newSanction.save();

      res
        .status(200)
        .json({ message: "New sanction items created", data: newSanction });
    } catch (err: any) {
      res.status(500).end();
      Logs("api:sanction:register:post", "error", err, guild_id);
    }
  }
);

router.get("/sanction", isPastille, async (req: Request, res: Response) => {
  const { guild_id } = req.query;

  try {
    const allSanction = await Sanction.find({
      guild_id: { $eq: guild_id },
      checkable: true,
    });
    res.status(200).json({ message: "Sanction find", data: allSanction });
  } catch (err: any) {
    res.status(500).end();
    Logs("api:sanction:get:all", "error", err, guild_id as string);
  }
});

export default router;
