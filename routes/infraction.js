const express = require("express");
const router = express.Router();
const Infraction = require("../model/Infraction");
const isPastille = require("../middlewares/isPastille");
const { logs } = require("../function/logs");

router.post("/infraction", isPastille, async (req, res) => {
  const { user_id, reason, date, guild_id } = req.body;

  try {
    const newInfraction = new Infraction({
      user_id: user_id,
      guild_id: guild_id,
      warn: {
        reason: reason,
        date: date
      }
    });
    await newInfraction.save();

    res.status(200).json({ message: "New infraction items created", data: newInfraction });
  } catch(error) {
    res.status(400).json({ message: "An error occured", error: error });
    logs("error", "api:infraction:post", error, guild_id);
  }
});

router.get("/infraction/all", isPastille, async (req, res) => {
  const { user_id, guild_id } = req.query;

  try {
    const allInfractions = await Infraction.countDocuments({ user_id: user_id, guild_id: guild_id });
    res.status(200).json({ message: 'Infractions find', count: allInfractions });
  }
  catch(error) {
    res.status(400).json({ message: "An error occured", error: error });
    logs("error", "api:infraction:get:all", error, guild_id);
  }
});

module.exports = router;