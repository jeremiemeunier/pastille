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
      const q_make = new Guild(req.body);
      await q_make.save();

      res.status(201).json({ message: "Guild added successfully" });
    } catch (err: any) {
      Logs(["api", "guild", "join"], "error", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
