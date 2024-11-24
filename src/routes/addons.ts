import { Router } from "express";
import { isPastille } from "../middlewares/isPastille";
import Addons from "@models/Addons";
import Logs from "@libs/Logs";

const router = Router();

router.get("/addons", isPastille, async (req, res) => {
  const { guild_id } = req.query;

  try {
    const allAddonsRequest = await Addons.find({ guild_id: { $eq: guild_id } });

    if (allAddonsRequest.length === 0) {
      res.status(404).json({ message: "No addons", http_response: 404 });
    } else {
      res.status(200).json({ data: allAddonsRequest });
    }
  } catch (error: any) {
    res.status(400).json({ message: "An error occured", error: error });
    Logs("api:addons:get", "error", error, guild_id as string);
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
  } catch (error: any) {
    res.status(400).json({ message: "An error occured", error: error });
    Logs("api:addons:post", "error", error, guild_id);
  }
});

router.put("/addons/update", isPastille, async (req, res) => {
  const { guild_id, name, active, channel, role, id } = req.body;

  if (!guild_id && !name && !active && !channel && !role) {
    res.status(400).json({ message: "You must provide all inputs" });
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
  } catch (error: any) {
    res.status(400).json({ message: "An error occured", error: error });
    Logs("api:addons:put", "error", error, guild_id);
  }
});

export default router;
