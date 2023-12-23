const express = require("express");
const router = express.Router();
const Command = require("../model/Command");
const isPastille = require("../middlewares/isPastille");
const { logs } = require('../function/logs');

router.get("/commands", isPastille, async (req, res) => {
  const { guild } = req.query;

  try {
    const allCommandsRequest = await Command.find({ guild_id: guild });
    
    if(allCommandsRequest.length === 0) { res.status(404).json({ message: "No commands" }); }
    else {
      res.status(200).json({ data: allCommandsRequest });
    }
  }
  catch(error) { logs("error", "api:commands:get", error); }
});

module.exports = router;