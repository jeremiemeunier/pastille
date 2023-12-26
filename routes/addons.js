const express = require("express");
const router = express.Router();
const Addons = require("../model/Addons");
const isPastille = require("../middlewares/isPastille");
const { logs } = require('../function/logs');

router.get("/addons", isPastille, async (req, res) => {
  const { guild_id } = req.query;

  try {
    const allAddonsRequest = await Addons.find({ guild_id: guild_id });
    
    if(allAddonsRequest.length === 0) { res.status(404).json({ message: "No addons" }); }
    else {
      res.status(200).json({ data: allAddonsRequest });
    }
  }
  catch(error) {
    res.status(400).json({ message: "An error occured", error: error });
    logs("error", "api:addons:get", error, guild_id);
  }
});

module.exports = router;