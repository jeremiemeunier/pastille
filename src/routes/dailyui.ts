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
        { _id: id },
        { available: false }
      );
      res
        .status(201)
        .json({ message: "State updated for DailyUi", data: updateDailyUi });
    } catch (error: any) {
      Logs("api:dailyui:put", "error", error);
    }
  }
);

router.get("/dailyui", isPastille, async (req: Request, res: Response) => {
  const { guild_id } = req.query;

  try {
    const dailyuiNotSend = await Dailyui.findOne({
      available: true,
      guild_id: guild_id,
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
  } catch (error: any) {
    Logs("api:dailyui:get", "error", error, guild_id as string);
  }
});

router.post(
  "/dailyui",
  isPastille,
  rateLimiter,
  async (req: Request, res: Response) => {
    const { guild_id, state, title, description } = req.body;

    if (!guild_id || !title || !description) {
      res.status(400).json({ message: "Complete all input", data: req.body });
    } else {
      try {
        const newDailyUi = new Dailyui({
          guild_id: guild_id,
          available: state || true,
          title: title,
          description: description,
        });
        await newDailyUi.save();

        res
          .status(200)
          .json({ message: "New daily challenge added", data: newDailyUi });
      } catch (error: any) {
        Logs("api:dailyui:add", "error", error, guild_id);
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

    data.map(async (dailychallenge: DailyUiTypes) => {
      try {
        const newDailyUi = new Dailyui({
          available: true,
          guild_id: dailychallenge.guild_id,
          title: dailychallenge.title,
          description: dailychallenge.description,
        });
        await newDailyUi.save();
      } catch (error: any) {
        Logs("api:dailyui:mass", "error", error);
      }
    });

    res.status(200).json({ message: "New daily challenge added" });
  }
);

export default router;
