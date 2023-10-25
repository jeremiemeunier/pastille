const express = require("express");
const router = express.Router();
const Infraction = require("../model/Infraction");
const isPastille = require("../middlewares/isPastille");

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

        res.status(200).json({ message: "New infraction items created" });
    }
    catch(error) {
        console.log(error);
    }
});

router.get("/infraction/all", isPastille, async (req, res) => {
    const { user_id } = req.query;

    try {
        const allInfractions = await Infraction.countDocuments({ user_id: user_id });
        res.status(200).json({ message: 'Infractions find', count: allInfractions });
    }
    catch(error) { res.status(500).json({ message: error.message }); }
});

module.exports = router;