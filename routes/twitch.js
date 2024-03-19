const express = require("express");
const router = express.Router();
const Streamer = require("../model/Twitch");
const isPastille = require("../middlewares/isPastille");
const { logs } = require("../function/logs");

router.get("/twitch", isPastille, async (req, res) => {
  const { guild_id } = req.query;

  try {
    const allTwitchPings = await Streamer.find({ guild_id: { $eq: guild_id } });

    if (allTwitchPings.length > 0) {
      res.status(200).json({
        message: "Find all pings",
        data: allTwitchPings,
      });
    } else {
      res.status(404).json({ message: "Empty pings" });
    }
  } catch (error) {
    res.status(400).json({ message: "An error occured", error: error });
    logs("error", "api:twitch:get", error, guild_id);
  }
});

router.get("/twitch/id", isPastille, async (req, res) => {
  const { id } = req.query;

  try {
    const twitchItem = Streamer.findById({ _id: { $eq: id } });

    if (!twitchItem) {
      res.status(404).json({ message: "Item not found" });
    }

    res.status(200).json({ message: "Item found", data: twitchItem });
  } catch (error) {
    res.status(400).json({ message: "An error occured", error: error });
    logs("error", "api:twitch:get:id", error);
  }
});

router.post("/twitch/add", isPastille, async (req, res) => {
  const { guild_id, twitch_id, twitch_name, message, progress } = req.body;

  if (!twitch_id || !twitch_name || !guild_id) {
    res.status(400).json({ message: "Must provide a id and name for twitch" });
  } else {
    try {
      const newAddPing = new Streamer({
        guild_id: guild_id,
        twitch: {
          id: twitch_id,
          name: twitch_name,
        },
        message: message || null,
        progress: progress || false,
      });
      await newAddPing.save();
      res
        .status(200)
        .json({ message: "Streamer added to the list", data: newAddPing });
    } catch (error) {
      res.status(400).json({ message: "An error occured", error: error });
      logs("error", "api:twitch:add", error, guild_id);
    }
  }
});

router.delete("/twitch/remove", isPastille, async (req, res) => {
  const { id } = req.query;

  try {
    await Streamer.findByIdAndDelete({ _id: { $eq: id } });
    res.status(200).json({ message: "Item deleted" });
  } catch (error) {
    res.status(400).json({ message: "An error occured", error: error });
    logs("error", "api:twitch:delete", error);
  }
});

module.exports = router;
