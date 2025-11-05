import { Request, Response, Router } from "express";
import { isPastille } from "../middlewares/isPastille";
import Dailyui from "@models/Dailyui";
import { DailyUiTypes } from "@/types/Dailyui.types";
import Logs from "@libs/Logs";
import { rateLimiter } from "@libs/RateLimiter";
import { isValidObjectId } from "mongoose";

const router = Router();

router.put(
  "/dailyui",
  isPastille,
  rateLimiter,
  async (req: Request, res: Response) => {
    const { id } = req.query;

    if (!id || !isValidObjectId(id)) {
      res.status(400).json({ message: "Invalid Id provided" });
      return;
    }

    try {
      const q_update = await Dailyui.findOneAndUpdate(
        { _id: { $eq: id } },
        { available: false },
        { new: true }
      );
      res.status(201).json(q_update);
    } catch (err: any) {
      res.status(500).json({ message: "Internal server error", error: err });
      Logs("api:dailyui:put", "error", err);
    }
  }
);

router.get(
  "/dailyui",
  isPastille,
  rateLimiter,
  async (req: Request, res: Response) => {
    const { guild_id } = req.query;

    if (!guild_id || typeof guild_id !== "string") {
      res.status(400).end();
      return;
    }

    try {
      const q_dailyui = await Dailyui.findOne({
        available: true,
        guild_id: { $eq: guild_id },
      });

      if (q_dailyui) {
        res.status(200).json(q_dailyui);
        return;
      }

      res.status(404).json({ message: "No dailyui available" });
    } catch (err: any) {
      res.status(500).json({ message: "Internal server error", error: err });
      Logs("api:dailyui:get", "error", err, guild_id as string);
    }
  }
);

router.post(
  "/dailyui",
  isPastille,
  rateLimiter,
  async (req: Request, res: Response) => {
    const { guild_id, state, title, description } = req.body;

    if (
      !guild_id ||
      typeof guild_id !== "string" ||
      !title ||
      typeof title !== "string" ||
      !description ||
      typeof description !== "string"
    ) {
      res.status(400).json({ message: "Complete all input" });
    } else {
      try {
        const q_make = new Dailyui({
          guild_id: guild_id,
          available: state ?? true,
          title: title,
          description: description,
        });
        await q_make.save();

        res.status(200).json(q_make);
      } catch (err: any) {
        res.status(500).json({ message: "Internal server error", error: err });
        Logs("api:dailyui:add", "error", err, guild_id);
      }
    }
  }
);

router.post(
  "/dailyui/mass",
  isPastille,
  rateLimiter,
  async (req: Request, res: Response) => {
    const data = req.body.data;

    try {
      await Promise.all(
        data.map(async (dailychallenge: DailyUiTypes) => {
          const q_make = new Dailyui({
            available: true,
            guild_id: dailychallenge.guild_id,
            title: dailychallenge.title,
            description: dailychallenge.description,
          });
          await q_make.save();
        })
      );

      res.status(201).json({ message: "New daily challenge added" });
    } catch (err: any) {
      res.status(500).json({ message: "Internal server error", error: err });
      Logs("api:dailyui:mass", "error", err);
    }
  }
);

export default router;
