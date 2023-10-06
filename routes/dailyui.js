const express = require("express");
const router = express.Router();
const DailyUi = require("../model/Dailyui");
const isPastille = require("../middlewares/isPastille");
const { logsEmiter } = require('../function/logs');
const { ModalSubmitFields } = require("discord.js");

router.put("/dailyui", isPastille, async (req, res) => {
    try {
        const updateDailyUi = await DailyUi.findByIdAndUpdate(
            { _id: req.query.id },
            { state: true }
        );

        res.status(201).json({ message: 'State updated for DailyUi' });
        logsEmiter(`API Server : 🟢 | State updated for DailyUi`);
    }
    catch(error) {
        logsEmiter(`API Server : ⚠️  | ${error}`);
    }
});

router.get("/dailyui", isPastille, async (req, res) => {
    try {
        const dailyuiNotSend = await DailyUi.findOne({ state: false });

        if(!dailyuiNotSend) {
            res.status(404).json({
                message: "No dailyui available" });
            logsEmiter(`API Server : ⚠️  | No dailyui available`);
        }
        else {
            res.status(200).json({
                message: "DailyUi available",
                data: dailyuiNotSend
            });
            logsEmiter(`API Server : 🟢 | Dailyui available`);
        }
    }
    catch(error) {
        logsEmiter(`API Server : ⚠️  | ${error}`);
    }
})

router.post("/dailyui", isPastille, async (req, res) => {
    const { state, title, description } = req.body;

    if(!title || !description) {
        res.status(400).json({
            message: 'Complete all input',
            data: req.body });
        logsEmiter(`API Server : ⚠️  | Need to complete all inputs before request`);
    }
    else {
        try {
            const newDailyUi = new DailyUi({
                state: state,
                title: title,
                description: description
            })
            await newDailyUi.save();

            res.status(200).json({ message: 'New daily challenge added' });
            logsEmiter(`API Server : 🟢 | New daily challenge added`);
        }
        catch(error) {
            logsEmiter(`API Server : ⚠️  | ${error}`);
        }
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

            logsEmiter(`API Server : 🟢 | New daily challenge added`);
        }
        catch(error) {
            logsEmiter(`API Server : ⚠️  | ${error}`);
        }
    });
    
    res.status(200).json({ message: 'New daily challenge added' });
})

module.exports = router;