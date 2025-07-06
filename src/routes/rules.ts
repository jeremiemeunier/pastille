import { Request, Response, Router } from "express";
import { isPastille } from "../middlewares/isPastille";
import Rule from "@models/Rule";
import Logs from "@libs/Logs";
import { rateLimiter } from "@libs/RateLimiter";

const router = Router();

router.get("/rules", isPastille, async (req: Request, res: Response) => {
  const { guild_id } = req.query;

  try {
    const allRulesRequest = await Rule.find({ guild_id: { $eq: guild_id } });

    if (allRulesRequest.length === 0) {
      res.status(404).json({ message: "No rules", http_response: 404 });
    } else {
      res.status(200).json({ data: allRulesRequest });
    }
  } catch (error: any) {
    res.status(400).json({ message: "An error occured", error: error });
    Logs("api:rules:get", "error", error);
  }
});

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
      } catch (error: any) {
        res.status(400).json({ message: "An error occured", error: error });
        Logs("api:rules:post", "error", error, guild_id);
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

    if (!guild_id || !name || !description || !active || !id) {
      res.status(400).json({ message: "You must provide all input" });
    } else {
      try {
        const updatedRulesItem = await Rule.findByIdAndUpdate(
          { _id: { $eq: id } },
          {
            guild_id: guild_id,
            name: name,
            description: description,
            active: active,
          }
        );

        res.status(200).json({ data: updatedRulesItem });
      } catch (error: any) {
        res.status(400).json({ message: "An error occured", error: error });
        Logs("api:rules:put", "error", error, guild_id);
      }
    }
  }
);

export default router;
