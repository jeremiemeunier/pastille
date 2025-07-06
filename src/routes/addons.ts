import { Request, Response, Router } from "express";
import { isPastille } from "../middlewares/isPastille";
import Addons from "@models/Addons";
import Logs from "@libs/Logs";
import { rateLimiter } from "@libs/RateLimiter";
import { isValidObjectId } from "mongoose";

const router = Router();

router.get("/addons", isPastille, async (req: Request, res: Response) => {
  const { guild_id } = req.query;

  try {
    const allAddonsRequest = await Addons.find({ guild_id: { $eq: guild_id } });

    if (allAddonsRequest.length === 0) {
      res.status(404).json({ message: "No addons", http_response: 404 });
    } else {
      res.status(200).json({ data: allAddonsRequest });
    }
  } catch (err: any) {
    res.status(500).end();
    Logs("api:addons:get", "error", err, guild_id as string);
  }
});

router.post("/addons/add", isPastille, async (req, res) => {
  const { guild_id, name, active, channel, role } = req.body;

  if (!guild_id && !name && !active && !channel && !role) {
    res.status(400).json({ message: "You must provide all inputs" });
    return;
  }

  try {
    const newAddonsRegister = new Addons({
      guild_id: guild_id,
      name: name,
      active: active,
      channel: channel,
      role: role,
    });
    await newAddonsRegister.save();

    res
      .status(200)
      .json({ message: "New addons registred", data: newAddonsRegister });
  } catch (err: any) {
    res.status(500).end();
    Logs("api:addons:post", "error", err, guild_id);
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
      const updatedAddons = await Addons.findByIdAndUpdate(
        { _id: { $eq: id } },
        {
          guild_id: guild_id,
          name: name,
          active: active,
          channel: channel,
          role: role,
        }
      );

      res
        .status(200)
        .json({ message: "Addons has being updated", data: updatedAddons });
    } catch (err: any) {
      res.status(500).end();
      Logs("api:addons:put", "error", err, guild_id);
    }
  }
);

export default router;
