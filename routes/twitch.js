const express = require("express");
const router = express.Router();
const Twitch = require("../model/Twitch");
const isPastille = require("../middlewares/isPastille");
const { logsEmiter } = require('../function/logs');

router.post("/twitchping/add", isPastille, async (req, res) => {
  const { twitch_id, twitch_name, discord_id, discord_name, progress } = req.body;

  if(!twitch_id || !twitch_name) {
    res.status(400).json({
      message: "Must provide a id and name for twitch"
    });
    logsEmiter(`API Server : ⚠️  | Need to complete all inputs before request`);
  }
  else {
    try {
      const newAddPing = new Twitch({
        discord: {
          id: discord_id || "",
          name: discord_name || ""
        },
        twitch: {
          id: twitch_id,
          name: twitch_name
        },
        progress: progress || false
      });
      await newAddPing.save();

      res.status(200).json({ message: 'New streamer added to ping list' });
      logsEmiter(`API Server : 🟢 | New streamer added to ping list`);
    }
    catch(error) {
      logsEmiter(`API Server : ⚠️  | ${error}`);
    }
  }
});

router.delete("/twitchping/remove", isPastille, async (req, res) => {
  const { twitch_name } = req.body;

});

router.get("/twitchping/list", isPastille, async (req, res) => {
  try {
    const allTwitchPings = await Twitch.find();

    if(allTwitchPings.length > 0) {
      res.status(200).json({
        message: "Find all pings",
        data: allTwitchPings
      })
    }
    else {
      res.status(404).json({ message: "Empty pings" });
    }
  }
  catch(error) {
    res.status(400).json({ message: "An error occured" });
  }
});

module.exports = router;