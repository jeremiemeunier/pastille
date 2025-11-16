import { Request, Response, Router } from "express";
import { isPastille } from "../middlewares/isPastille";
import Addons from "@models/Addons.model";
import Logs from "@libs/Logs";
import { rateLimiter } from "@libs/RateLimiter";
import { isValidObjectId } from "mongoose";

const router = Router();

router.get(
  "/addons",
  isPastille,
  rateLimiter,
  async (req: Request, res: Response) => {
    const { guild_id } = req.query;

    try {
      const q_list = await Addons.find({
        guild_id: { $eq: guild_id },
      });

      if (q_list.length > 0) {
        res.status(200).json(q_list);
        return;
      }

      res.status(404).json({ message: "No addons" });
    } catch (err: any) {
      res.status(500).json({
        message: "Internal server error",
        error: err,
      });
      Logs({
        node: ["api", "addons", "get"],
        state: "error",
        content: err,
        details: guild_id as string,
      });
    }
  }
);

router.post("/addons/add", isPastille, rateLimiter, async (req, res) => {
  const { guild_id, name, active, channel, role } = req.body;

  if (!guild_id && !name && !active && !channel && !role) {
    res.status(400).json({ message: "You must provide all inputs" });
    return;
  }

  try {
    const q_make = new Addons({
      guild_id: guild_id,
      name: name,
      active: active,
      channel: channel,
      role: role,
    });
    await q_make.save();

    res.status(201).json(q_make);
  } catch (err: any) {
    res.status(500).json({
      message: "Internal server error",
      error: err,
    });
    Logs({
      node: ["api", "addons", "post"],
      state: "error",
      content: err,
      details: guild_id,
    });
  }
});

router.put(
  "/addons/update",
  isPastille,
  rateLimiter,
  async (req: Request, res: Response) => {
    const { guild_id, name, active, channel, role, id } = req.body;

    if (!id || !isValidObjectId(id)) {
      res.status(400).json({ message: "Invalid Id provided" });
      return;
    }

    if (
      !guild_id ||
      typeof guild_id !== "string" ||
      !name ||
      typeof name !== "string" ||
      !active ||
      typeof active !== "boolean" ||
      !channel ||
      typeof channel !== "string" ||
      !role ||
      typeof role !== "string"
    ) {
      res.status(400).json({ message: "You must provide all correct inputs" });
      return;
    }

    try {
      const q_update = await Addons.findOneAndUpdate(
        { _id: { $eq: id } },
        {
          guild_id: guild_id,
          name: name,
          active: active,
          channel: channel,
          role: role,
        },
        { new: true }
      );

      res.status(201).json(q_update);
    } catch (err: any) {
      res.status(500).json({
        message: "Internal server error",
        error: err,
      });
      Logs({
        node: ["api", "addons", "put"],
        state: "error",
        content: err,
        details: guild_id,
      });
    }
  }
);

export default router;
