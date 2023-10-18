const express = require("express");
const router = express.Router();
const Infraction = require("../model/Infraction");
const isPastille = require("../middlewares/isPastille");

router.put("/infraction", isPastille, async (req, res) => {
    const { user_id, warns } = req.body;

    if(!user_id || !warns) {
        return res.status(409).json({ message: "Please complete all input"});
    }

    const infractionExist = await Infraction.findOne({ user_id: user_id });

    if(!infractionExist) {
        return res.status(409).json({ message: "This User do not exist !" });
    }

    if(infractionExist) {
        const infractionUpdate = await Infraction.updateOne({ user_id: user_id }, {
            $set: {
                warns: warns
            }
        });

        res.status(201).json({ message: 'Infraction item updated' });
    }
});

router.post("/infraction", isPastille, async (req, res) => {
    const { user_id, warns } = req.body;

    try {
        const newInfraction = new Infraction({
            user_id: user_id,
            warns: warns
        });
        await newInfraction.save();

        res.status(200).json({ message: "New infraction items created" });
    }
    catch(error) {
        console.log(error);
    }
});

router.get("/infraction/user", isPastille, async (req, res) => {
    const { user_id } = req.query;
    
    try {
        const infractionExist = await Infraction.findOne({ user_id: user_id });

        if(!infractionExist) {
            res.status(404).json({ message: "User not exist", userExist: false });
        }
        else {
            res.status(200).json({ message: "User exist", userExist: true, userData: infractionExist });
        }
    }
    catch(error) {
        console.log(error);
    }    
});

module.exports = router;