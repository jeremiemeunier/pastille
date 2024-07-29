import { Router } from "express";
import { isPastille } from "../middlewares/isPastille";
import Dailyui from "@models/Dailyui";
import logs from "@functions/logs";
import { DailyUiTypes } from "@/types/Dailyui.types";

const router = Router();

router.put("/dailyui", isPastille, async (req, res) => {
  const { id } = req.query;

  try {
    const updateDailyUi = await Dailyui.findByIdAndUpdate(
      { _id: id },
      { available: false }
    );
    res
      .status(201)
      .json({ message: "State updated for DailyUi", data: updateDailyUi });
  } catch (error: any) {
    logs("error", "api:dailyui:put", error);
  }
});

router.get("/dailyui", isPastille, async (req, res) => {
  const { guild_id } = req.query;

  try {
    const dailyuiNotSend = await Dailyui.findOne({
      available: true,
      guild_id: guild_id,
    });

    if (!dailyuiNotSend) {
      res.status(404).json({ message: "No dailyui available" });
    } else {
      res
        .status(200)
        .json({ message: "DailyUi available", data: dailyuiNotSend });
    }
  } catch (error: any) {
    logs("error", "api:dailyui:get", error, guild_id as string);
  }
});

router.post("/dailyui", isPastille, async (req, res) => {
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
      logs("error", "api:dailyui:add", error, guild_id);
    }
  }
});

router.post("/dailyui/mass", isPastille, async (req, res) => {
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
      logs("error", "api:dailyui:mass", error);
    }
  });

  res.status(200).json({ message: "New daily challenge added" });
});

export default router;
