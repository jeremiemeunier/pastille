import { Request, Response, Router } from "express";
import { isPastille } from "../middlewares/isPastille";
import Rule from "@models/Rule";
import Logs from "@libs/Logs";
import { rateLimiter } from "@libs/RateLimiter";
import { isValidObjectId } from "mongoose";

const router = Router();

router.get(
  "/rules",
  isPastille,
  rateLimiter,
  async (req: Request, res: Response) => {
    const { guild_id } = req.query;

    try {
      const q_list = await Rule.find({ guild_id: { $eq: guild_id } });

      if (q_list.length > 0) {
        res.status(200).json({ data: q_list });
        return;
      }

      res.status(404).json({ message: "No rules found" });
    } catch (err: any) {
      res.status(500).json({ message: "Internal server error", error: err });
      Logs("api:rules:get", "error", err);
    }
  }
);

router.post(
  "/rules/add",
  isPastille,
  rateLimiter,
  async (req: Request, res: Response) => {
    const { guild_id, name, description, active } = req.body;

    if (!guild_id || !name || !description || !active) {
      res.status(400).json({ message: "You must provide all input" });
    } else {
      try {
        const q_make = new Rule({
          guild_id: guild_id,
          name: name,
          description: description,
          active: active,
        });

        await q_make.save();
        res.status(201).json({ data: q_make });
      } catch (err: any) {
        res.status(500).json({ message: "Internal server error", error: err });
        Logs("api:rules:post", "error", err, guild_id);
      }
    }
  }
);

router.put(
  "/rules/update",
  isPastille,
  rateLimiter,
  async (req: Request, res: Response) => {
    const { guild_id, name, description, active, id } = req.body;

    if (!id || !isValidObjectId(id)) {
      res.status(400).json({ message: "Invalid Id provided" });
      return;
    }

    if (
      !guild_id ||
      typeof guild_id !== "string" ||
      !name ||
      typeof name !== "string" ||
      !description ||
      typeof description !== "string" ||
      active === undefined ||
      typeof active !== "boolean"
    ) {
      res.status(400).json({ message: "You must provide all input" });
    } else {
      try {
        const q_update = await Rule.findByIdAndUpdate(
          id,
          {
            guild_id: guild_id,
            name: name,
            description: description,
            active: active,
          },
          { new: true }
        );

        res.status(200).json({ data: q_update });
      } catch (err: any) {
        res.status(500).json({ message: "Internal server error", error: err });
        Logs("api:rules:put", "error", err, guild_id);
      }
    }
  }
);

export default router;
