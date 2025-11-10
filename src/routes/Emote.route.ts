import { Request, Response, Router } from "express";
import { isPastille } from "../middlewares/isPastille";
import Emote from "@models/Emote.model";
import { EmoteTypes } from "@/types/Emote.types";
import Logs from "@libs/Logs";
import { rateLimiter } from "@libs/RateLimiter";

const router = Router();

router.get(
  "/emotes",
  isPastille,
  rateLimiter,
  async (req: Request, res: Response) => {
    const { letter } = req.query;

    try {
      const q_list = await Emote.findOne({ letter: { $eq: letter } });

      if (q_list) {
        res.status(200).json(q_list);
        return;
      }

      res.status(404).json({ message: "No emotes found" });
    } catch (err: any) {
      res.status(500).json({ message: "Internal server error", error: err });
      Logs(["api", "emotes", "get"], "error", err);
    }
  }
);

router.get(
  "/emotes/all",
  isPastille,
  rateLimiter,
  async (req: Request, res: Response) => {
    const { limit } = req.query;

    try {
      let q_list;

      if (limit && parseInt(limit as string) > 0) {
        q_list = await Emote.find()
          .limit(parseInt(limit as string))
          .sort({ letter: "asc" });
      } else {
        q_list = await Emote.find().sort({ letter: "asc" });
      }

      if (q_list.length > 0) {
        res.status(200).json(q_list);
        return;
      }

      res.status(404).json({ message: "No letters found" });
    } catch (err: any) {
      res.status(500).json({ message: "Internal server error", error: err });
      Logs(["api", "emotes", "get", "all"], "error", err);
    }
  }
);

router.post(
  "/emotes/mass",
  isPastille,
  rateLimiter,
  async (req: Request, res: Response) => {
    const { emotes } = req.body;

    try {
      await Promise.all(
        emotes.map(async (item: EmoteTypes) => {
          const q_make = new Emote({
            letter: item.letter,
            emote: item.emote,
          });
          await q_make.save();
        })
      );
      res.status(201).json({ message: "Emotes added" });
    } catch (err: any) {
      res.status(500).json({ message: "Internal server error", error: err });
      Logs(["api", "emotes", "post", "mass"], "error", err);
    }
  }
);

export default router;
