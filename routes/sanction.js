const express = require("express");
const router = express.Router();
const Sanction = require("../model/Sanction");
const isPastille = require("../middlewares/isPastille");



router.post("/sanction", isPastille, async (req, res) => {
    const { user_id, warns } = req.body;

    try {
        const newSanction = new Sanction({
            user_id: user_id,
            warns: warns
        });
        await newSanction.save();

        res.status(200).json({ message: "New sanction items created" });
    }
    catch(error) {
        console.log(error);
    }
});