import { Request, Response, Router } from "express";
import { isPastille } from "../middlewares/isPastille";
import Role from "@models/Role";
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
      const allRolesRequest = await Role.find({ guild_id: { $eq: guild_id } });

      if (allRolesRequest.length === 0) {
        res.status(404).json({ message: "No roles", http_response: 404 });
      } else {
        res.status(200).json({ data: allRolesRequest });
      }
    } catch (err: any) {
      res.status(500).end();
      Logs("api:roles:get", "error", err, guild_id as string);
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
        const newRoleRegistre = new Role({
          guild_id: guild_id,
          name: name,
          role: role,
          emote: emote,
          description: description,
        });

        await newRoleRegistre.save();
        res.status(201).json({ data: newRoleRegistre });
      } catch (err: any) {
        res.status(500).end();
        Logs("api:roles:post", "error", err, guild_id as string);
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
        const updatedRoleItem = await Role.findByIdAndUpdate(
          { _id: { $eq: id } },
          {
            guild_id: { $eq: guild_id },
            name: name,
            description: description,
            role: role,
            emote: emote,
          }
        );

        res.status(200).json({ data: updatedRoleItem });
      } catch (err: any) {
        res.status(500).end();
        Logs("api:roles:put", "error", err, guild_id as string);
      }
    }
  }
);

export default router;
