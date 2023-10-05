const express = require("express");
const router = express.Router();
const Moderation = require("../model/Moderation");
const isPastille = require("../middlewares/isPastille");

router.put("/moderation/", isPastille, async (req, res) => {
    const { user_id, warns, sanctions } = req.body;

    if(!user_id || !warns || !sanctions) {
        return res.status(409).json({ message: "Please complete all input"});
    }

    const moderationExist = await Moderation.findOne({ user_id: user_id });

    if(!moderationExist) {
        return res.status(409).json({ message: "This User do not exist !" });
    }

    if(moderationExist) {
        const moderationUpdate = await Moderation.updateOne({ user_id: user_id }, [
            { warns: warns },
            { sanctions: sanctions }
        ])
    }
});

router.post("/moderation/", isPastille, async (req, res) => {
    const { user_id, warns, sanctions } = req.body;

    try {
        const newModeration = new Moderation({
            user_id: user_id,
            warns: warns,
            sanctions: sanctions
        });

        res.status(200).json({ message: "New moderation items created" });
    }
    catch(error) {
        console.log(error);
    }
});

router.get("/moderation/user/", isPastille, async (req, res) => {
    const { user_id } = req.query;
    
    try {
        const moderationExist = await Moderation.findOne({ user_id: user_id });

        if(!moderationExist) {
            res.status(404).json({ message: "User not exist", user_exist: false });
        }
        else {
            res.status(200).json({ message: "User exist", user_exist: true });
        }
    }
    catch(error) {
        console.log(error);
    }    
});

module.exports = router;