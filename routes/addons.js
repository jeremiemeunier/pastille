const express = require("express");
const router = express.Router();
const Addons = require("../model/Addons");
const isPastille = require("../middlewares/isPastille");
const { logs } = require('../function/logs');

router.get("/addons", isPastille, async (req, res) => {
  const { guild } = req.query;

  try {
    const allAddonsrequest = await Addons.find({ guild_id: guild });
    
    if(!allAddonsrequest) { res.status(404).json({ message: "No addons" }); }
    else {
      res.status(200).json({ data: allAddonsrequest });
    }
  }
  catch(error) { logs("error", "api:addons:get", error); }
});

module.exports = router;