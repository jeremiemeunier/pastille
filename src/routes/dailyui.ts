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
      const updateDailyUi = await Dailyui.findByIdAndUpdate(
        { _id: { $eq: id } },
        { available: false }
      );
      res
        .status(201)
        .json({ message: "State updated for DailyUi", data: updateDailyUi });
    } catch (err: any) {
      res.status(500).end();
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
      const dailyuiNotSend = await Dailyui.findOne({
        available: true,
        guild_id: { $eq: guild_id },
      });

      if (!dailyuiNotSend) {
        res
          .status(404)
          .json({ message: "No dailyui available", http_response: 404 });
      } else {
        res
          .status(200)
          .json({ message: "DailyUi available", data: dailyuiNotSend });
      }
    } catch (err: any) {
      res.status(500).end();
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
      res.status(400).json({ message: "Complete all input", data: req.body });
    } else {
      try {
        const newDailyUi = new Dailyui({
          guild_id: { $eq: guild_id },
          available: state || true,
          title: title,
          description: description,
        });
        await newDailyUi.save();

        res
          .status(200)
          .json({ message: "New daily challenge added", data: newDailyUi });
      } catch (err: any) {
        res.status(500).end();
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
          const newDailyUi = new Dailyui({
            available: true,
            guild_id: dailychallenge.guild_id,
            title: dailychallenge.title,
            description: dailychallenge.description,
          });
          await newDailyUi.save();
        })
      );

      res.status(200).json({ message: "New daily challenge added" });
    } catch (err: any) {
      res.status(500).end();
      Logs("api:dailyui:mass", "error", err);
    }
  }
);

export default router;
