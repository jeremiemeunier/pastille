import { Router } from "express";
import { isPastille } from "../middlewares/isPastille";
import Role from "@models/Role";
import Logs from "@libs/Logs";

const router = Router();

router.get("/roles", isPastille, async (req, res) => {
  const { guild_id } = req.query;

  try {
    const allRolesRequest = await Role.find({ guild_id: { $eq: guild_id } });

    if (allRolesRequest.length === 0) {
      res.status(404).json({ message: "No roles", http_response: 404 });
    } else {
      res.status(200).json({ data: allRolesRequest });
    }
  } catch (error: any) {
    res.status(400).json({ message: "An error occured", error: error });
    Logs("api:roles:get", "error", error, guild_id as string);
  }
});

router.post("/roles/add", isPastille, async (req, res) => {
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
    } catch (error: any) {
      res.status(400).json({ message: "An error occured", error: error });
      Logs("api:roles:post", "error", error, guild_id as string);
    }
  }
});

router.put("/roles/update", isPastille, async (req, res) => {
  const { guild_id, name, description, role, id, emote } = req.body;

  if (!guild_id || !name || !description || !role || !emote || !id) {
    res.status(400).json({ message: "You must provide all input" });
  } else {
    try {
      const updatedRoleItem = await Role.findByIdAndUpdate(
        { _id: { $eq: id } },
        {
          guild_id: guild_id,
          name: name,
          description: description,
          role: role,
          emote: emote,
        }
      );

      res.status(200).json({ data: updatedRoleItem });
    } catch (error: any) {
      res.status(400).json({ message: "An error occured", error: error });
      Logs("api:roles:put", "error", error, guild_id as string);
    }
  }
});

export default router;
