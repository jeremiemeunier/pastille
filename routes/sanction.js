const express = require("express");
const router = express.Router();
const Sanction = require("../model/Sanction");
const isPastille = require("../middlewares/isPastille");

router.post("/sanction", isPastille, async (req, res) => {
    const { user_id, level, date, end, guild_id } = req.body;

    try {
        const newSanction = new Sanction({
            user_id: user_id,
            guild_id: guild_id,
            sanction: {
                level: level,
                date: date,
                ending: end
            }
        });
        await newSanction.save();

        res.status(200).json({ message: "New sanction items created" });
    }
    catch(error) { console.log(error); }
});

router.get("/sanction", isPastille, async (req, res) => {
    try {
        const allSanction = await Sanction.find();
        res.status(200).json({ message: "Sanction find", items: allSanction });
    }
    catch(error) { console.log(error); }
})

module.exports = router;