const fs = require('node:fs');
const { logsEmiter } = require('../logs');
const { automodSanction } = require('./automodSanction');

const automodRegister = (user, warn, guild) => {
    const userId = user.user.id;
    const execFolder = __dirname;
    const binFolder = execFolder.replace('function/automod', 'bin/automod/');
    const today = Date.parse(new Date());
    const newInfraction = { "warn": warn, "time": today };

    try {
        let warnList = JSON.parse(fs.readFileSync(`${binFolder}${userId}.txt`, 'utf8', (error, data) => {
            if(error) { logsEmiter(`[automod:register] reading file : ${error}`); }
        }));
        warnList.warns.push(newInfraction);

        fs.writeFileSync(`${binFolder}${userId}.txt`, JSON.stringify(warnList), (error) => {
            if(error) { logsEmiter(`[automod:register] Writting file : ${error}`); }
        });
    }
    catch(error) {
        logsEmiter(`[automod:register] No file : ${error}`);
        fs.appendFileSync(`${binFolder}${userId}.txt`, JSON.stringify({ "warns": [ newInfraction ], "sanctions": [] }), (error) => {
            if(error) { logsEmiter(`[automod:register] Creating file : ${error}`); }
        });
    }

    automodSanction(user, guild);
}

module.exports = { automodRegister }