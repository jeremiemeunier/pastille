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
      const allRulesRequest = await Rule.find({ guild_id: { $eq: guild_id } });

      if (allRulesRequest.length === 0) {
        res.status(404).json({ message: "No rules", http_response: 404 });
      } else {
        res.status(200).json({ data: allRulesRequest });
      }
    } catch (err: any) {
      res.status(500).end();
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
        const newRulesRegistre = new Rule({
          guild_id: guild_id,
          name: name,
          description: description,
          active: active,
        });

        await newRulesRegistre.save();
        res.status(201).json({ data: newRulesRegistre });
      } catch (err: any) {
        res.status(500).end();
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
      !active ||
      typeof active !== "boolean"
    ) {
      res.status(400).json({ message: "You must provide all input" });
    } else {
      try {
        const updatedRulesItem = await Rule.findByIdAndUpdate(
          id,
          {
            guild_id: guild_id,
            name: name,
            description: description,
            active: active,
          },
          { new: true }
        );

        res.status(200).json({ data: updatedRulesItem });
      } catch (err: any) {
        res.status(500).end();
        Logs("api:rules:put", "error", err, guild_id);
      }
    }
  }
);

export default router;
