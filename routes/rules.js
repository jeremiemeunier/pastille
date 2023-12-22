const express = require("express");
const router = express.Router();
const Rule = require("../model/Rule");
const isPastille = require("../middlewares/isPastille");
const { logs } = require('../function/logs');

router.get("/rules", isPastille, async (req, res) => {
  const { guild } = req.query;

  try {
    const allRulesRequest = await Rule.find({ guild_id: guild });
    
    if(allRulesRequest.length === 0) { res.status(404).json({ message: "No rules" }); }
    else {
      res.status(200).json({ data: allRulesRequest });
    }
  }
  catch(error) { logs("error", "api:rules:get", error); }
});

router.post("/rules/add", isPastille, async (req, res) => {
  const { guild, name, description, active } = req.body;

  if(!guild || !name || !description || !active) {
    res.status(400).json({ message: "You must provide all input" });
  }
  else {
    try {
      const newRulesRegistre = new Rule({
        guild_id: guild,
        name: name,
        description: description, 
        active: active
      });

      await newRulesRegistre.save();
      res.status(201).json({ data: newRulesRegistre });
    }
    catch(error) {
      logs("error", "api:rule:post", error);
      res.status(400).json({ message: error });
    }
  }
});

router.put("/rules/update", isPastille, async (req, res) => {
  const { guild, name, description, active, id } = req.body;

  if(!guild || !name || !description || !active || !id) {
    res.status(400).json({ message: "You must provide all input" });
  }
  else {
    try {
      const updatedRulesItem = await Rule.findByIdAndUpdate(
        { _id: id },
        {
          guild_id: guild,
          name: name,
          description: description,
          active: active
        }
      );

      res.status(200).json({ data: updatedRulesItem });
    }
    catch(error) {
      logs("error", "api:rule:put", error);
      res.status(400).json({ message: error });
    }
  }
});

module.exports = router;