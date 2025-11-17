import { Request, Response, Router } from "express";
import { isPastille } from "../middlewares/isPastille.middle";
import Role from "@models/Role.model";
import Logs from "@libs/Logs";
import { rateLimiter } from "@libs/RateLimiter";
import { isValidObjectId } from "mongoose";

const router = Router();

router.get(
  "/roles",
  isPastille,
  rateLimiter,
  async (req: Request, res: Response) => {
    const { guild_id } = req.query;

    try {
      const q_list = await Role.find({ guild_id: { $eq: guild_id } });

      if (q_list.length > 0) {
        res.status(200).json(q_list);
        return;
      }

      res.status(404).json({ message: "No roles found" });
    } catch (err: any) {
      res.status(500).json({ message: "Internal server error", error: err });
      Logs({
        node: ["api", "roles", "get"],
        state: "error",
        content: err,
        details: guild_id as string,
      });
    }
  }
);

router.post(
  "/roles/add",
  isPastille,
  rateLimiter,
  async (req: Request, res: Response) => {
    const { guild_id, name, description, role, emote } = req.body;

    if (!guild_id || !name || !description || !role || !emote) {
      res.status(400).json({ message: "You must provide all input" });
    } else {
      try {
        const q_make = new Role({
          guild_id: guild_id,
          name: name,
          role: role,
          emote: emote,
          description: description,
        });

        await q_make.save();
        res.status(201).json(q_make);
      } catch (err: any) {
        res.status(500).json({ message: "Internal server error", error: err });
        Logs({
          node: ["api", "roles", "post"],
          state: "error",
          content: err,
          details: guild_id as string,
        });
      }
    }
  }
);

router.put(
  "/roles/update",
  isPastille,
  rateLimiter,
  async (req: Request, res: Response) => {
    const { guild_id, name, description, role, id, emote } = req.body;

    if (!id || !isValidObjectId(id) || typeof id !== "string") {
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
      !role ||
      typeof role !== "string" ||
      !emote ||
      typeof emote !== "string"
    ) {
      res.status(400).json({ message: "You must provide all input" });
    } else {
      try {
        const q_update = await Role.findByIdAndUpdate(
          id,
          {
            guild_id: guild_id,
            name: name,
            description: description,
            role: role,
            emote: emote,
          },
          { new: true }
        );

        res.status(200).json(q_update);
      } catch (err: any) {
        res.status(500).json({ message: "Internal server error", error: err });
        Logs({
          node: ["api", "roles", "put"],
          state: "error",
          content: err,
          details: guild_id as string,
        });
      }
    }
  }
);

export default router;
