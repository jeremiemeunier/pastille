const express = require("express");
const router = express.Router();
const Emote = require("../model/Emote");
const isPastille = require("../middlewares/isPastille");
const { logs } = require('../function/logs');

router.get("/emotes", isPastille, async (req, res) => {
  const { letter } = req.query;

  try {
    const letterRequest = await Emote.findOne({ letter: letter });
    
    if(letterRequest) { res.status(404).json({ message: "No emotes" }); }
    else {
      res.status(200).json({ data: letterRequest });
    }
  }
  catch(error) { logs("error", "api:emotes:get", error); }
});

router.get("/emotes/all", isPastille, async (req, res) => {
  const { limit } = req.query;

  try {
    let allLettersRequest;

    if(limit > 0) { allLettersRequest = await Emote.find().limit(limit).sort({ letter: "asc" }); }
    else { allLettersRequest = await Emote.find().sort({ letter: "asc" }); }

    if(allLettersRequest.length > 0) { res.status(200).json({ data: allLettersRequest }); }
    else { res.status(404).json({ message: "No letters found" }); }
  }
  catch(error) {
    res.status(400).json({ message: "An error occured", error: error });
    logs("error", "api:emotes:get:all", error);
  }
});

router.post("/emotes/mass", isPastille, async (req, res) => {
  const { emotes } = req.body;

  try {
    emotes.map(async (item) => {
      const emoteRegister = new Emote({
        letter: item.letter,
        emote: item.emote
      });

      try {
        await emoteRegister.save();
      }
      catch(error) { logs("error", "api:emotes:post:save", error); }
    });
  }
  catch(error) {
    res.status(400).json({ error: error });
    logs("error", "api:emotes:post:mass", error);
  }
});

module.exports = router;