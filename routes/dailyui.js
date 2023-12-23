const express = require("express");
const router = express.Router();
const DailyUi = require("../model/Dailyui");
const isPastille = require("../middlewares/isPastille");
const { logs } = require('../function/logs');

router.put("/dailyui", isPastille, async (req, res) => {
  try {
    const updateDailyUi = await DailyUi.findByIdAndUpdate(
      { _id: req.query.id },
      { state: true }
    );
    res.status(201).json({ message: 'State updated for DailyUi', data: updateDailyUi });
  }
  catch(error) { logs("error", "api:dailyui:put", error); }
});

router.get("/dailyui", isPastille, async (req, res) => {
  try {
    const dailyuiNotSend = await DailyUi.findOne({ state: false });

    if(!dailyuiNotSend) { res.status(404).json({ message: "No dailyui available" }); }
    else { res.status(200).json({ message: "DailyUi available", data: dailyuiNotSend }); }
  }
  catch(error) { logs("error", "api:dailyui:get", error); }
})

router.post("/dailyui", isPastille, async (req, res) => {
  const { state, title, description } = req.body;

  if(!title || !description) {
    res.status(400).json({
      message: 'Complete all input',
      data: req.body });
    logs("warning", "api:dailyui:add", "Need to complete all inputs");
  }
  else {
    try {
      const newDailyUi = new DailyUi({
        state: state,
        title: title,
        description: description
      })
      await newDailyUi.save();

      res.status(200).json({ message: 'New daily challenge added', data: newDailyUi });
    }
    catch(error) { logs("error", "api:dailyui:add", error); }
  }
});

router.post('/dailyui/mass', isPastille, async (req, res) => {
  const data = req.body.data

  data.map(async dailychallenge => {
    try {
      const newDailyUi = new DailyUi({
        state: false,
        title: dailychallenge.title,
        description: dailychallenge.description
      })
      await newDailyUi.save();
    }
    catch(error) { logs("error", "api:dailyui:mass", error); }
  });
  
  res.status(200).json({ message: 'New daily challenge added' });
})

module.exports = router;