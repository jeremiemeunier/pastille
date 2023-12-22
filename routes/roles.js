const express = require("express");
const router = express.Router();
const Role = require("../model/Role");
const isPastille = require("../middlewares/isPastille");
const { logs } = require('../function/logs');

router.get("/roles", isPastille, async (req, res) => {
  const { guild } = req.query;

  try {
    const allRolesRequest = await Role.find({ guild_id: guild });
    
    if(allRolesRequest.length === 0) { res.status(404).json({ message: "No roles" }); }
    else {
      res.status(200).json({ data: allRolesRequest });
    }
  }
  catch(error) { logs("error", "api:roles:get", error); }
});

router.post("/roles/add", isPastille, async (req, res) => {
  const { guild, name, description, role, emote } = req.body;

  if(!guild || !name || !description || !role || !emote) {
    res.status(400).json({ message: "You must provide all input" });
  }
  else {
    try {
      const newRoleRegistre = new Role({
        guild_id: guild,
        name: name,
        role: role,
        emote: emote,
        description: description
      });

      await newRoleRegistre.save();
      res.status(201).json({ data: newRoleRegistre });
    }
    catch(error) {
      logs("error", "api:roles:post", error);
      res.status(400).json({ message: error });
    }
  }
});

router.put("/rules/update", isPastille, async (req, res) => {
  const { guild, name, description, role, id, emote } = req.body;

  if(!guild || !name || !description || !role || !emote || !id) {
    res.status(400).json({ message: "You must provide all input" });
  }
  else {
    try {
      const updatedRoleItem = await Role.findByIdAndUpdate(
        { _id: id },
        {
          guild_id: guild,
          name: name,
          description: description,
          role: role,
          emote: emote,
        }
      );

      res.status(200).json({ data: updatedRoleItem });
    }
    catch(error) {
      logs("error", "api:roles:put", error);
      res.status(400).json({ message: error });
    }
  }
});

module.exports = router;