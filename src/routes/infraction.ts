import { Router } from "express";
import { isPastille } from "../middlewares/isPastille";
import Infraction from "@models/Infraction";
import Logs from "@libs/Logs";

const router = Router();

router.post("/infraction", isPastille, async (req, res) => {
  const { user_id, reason, date, guild_id } = req.body;

  try {
    const newInfraction = new Infraction({
      user_id: user_id,
      guild_id: guild_id,
      warn: {
        reason: reason,
        date: date,
      },
    });
    await newInfraction.save();

    res
      .status(200)
      .json({ message: "New infraction items created", data: newInfraction });
  } catch (error: any) {
    res.status(400).json({ message: "An error occured", error: error });
    Logs("api:infraction:post", "error", error, guild_id);
  }
});

router.get("/infraction/all", isPastille, async (req, res) => {
  const { user_id, guild_id } = req.query;

  try {
    const allInfractions = await Infraction.countDocuments({
      user_id: { $eq: user_id },
      guild_id: { $eq: guild_id },
    });
    res
      .status(200)
      .json({ message: "Infractions find", count: allInfractions });
  } catch (error: any) {
    res.status(400).json({ message: "An error occured", error: error });
    Logs("api:infraction:get:all", "error", error, guild_id as string);
  }
});

export default router;
