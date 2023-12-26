const express = require("express");
const router = express.Router();
const Sanction = require("../model/Sanction");
const isPastille = require("../middlewares/isPastille");
const { logs } = require("../function/logs");

router.put("/sanction/update", isPastille, async (req, res) => {
  const { id } = req.query;

  try {
    const updateSanction = await Sanction.findByIdAndUpdate(
      { _id: id },
      { checkable: false });
    
    res.status(200).json({ data: updateSanction });
  }
  catch(error) {
    res.status(400).json({ error: error, message: "An error occured" });
    logs("error", "api:sanction:put", error, guild_id);
  }
});

router.post("/sanction/add", isPastille, async (req, res) => {
  const { user_id, level, date, end, guild_id } = req.body;

  try {
    const newSanction = new Sanction({
      user_id: user_id,
      guild_id: guild_id,
      sanction: {
        level: level,
        date: date,
        ending: end
      },
      checkable: true
    });
    await newSanction.save();

    res.status(200).json({ message: "New sanction items created", data: newSanction });
  }
  catch(error) { logs("error", "api:sanction:register:post", error); }
});

router.get("/sanction", isPastille, async (req, res) => {
  const { guild_id } = req.query;

  try {
    const allSanction = await Sanction.find({ guild_id: guild_id, checkable: true });
    res.status(200).json({ message: "Sanction find", data: allSanction });
  }
  catch(error) { logs("error", "api:sanction:get:all", error); }
})

module.exports = router;