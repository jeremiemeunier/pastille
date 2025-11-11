import { Request, Response, Router } from "express";
import { isPastille } from "../middlewares/isPastille";
import Logs from "@libs/Logs";
import { rateLimiter } from "@libs/RateLimiter";
import Guild from "@models/Guild.model";

const router = Router();

router.post(
  "/guild/join",
  isPastille,
  rateLimiter,
  async (req: Request, res: Response) => {
    try {
      const q_exist = await Guild.findOne({ id: { $eq: req.body.id } });

      if (q_exist) {
        try {
          await Guild.updateOne({ id: { $eq: req.body.id } }, { data: req.body });
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
