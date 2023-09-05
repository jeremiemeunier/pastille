const fs = require('node:fs');
const { logsEmiter } = require('./logs');

const automodRegister = (user, warn) => {
    const userId = user.user.id;
    const execFolder = __dirname;
    const binFolder = execFolder.replace('function', 'bin/automod/');
    const today = new Date();
    const newInfraction = { "warn": warn, "time": today };

    try {
        let warnList = JSON.parse(fs.readFileSync(`${binFolder}${userId}.txt`, 'utf8', (error, data) => {
            if(error) { console.log(error); }
        }));
        warnList.warns.push(newInfraction);

        fs.writeFileSync(`${binFolder}${userId}.txt`, JSON.stringify(warnList), (error) => {
            if(error) { console.log(error); }
        });
    }
    catch(error) {
        logsEmiter(error);
        fs.appendFileSync(`${binFolder}${userId}.txt`, JSON.stringify({ "warns": [ newInfraction ] }), (error) => {
            if(error) { console.log(error); }
        });
    }
}

module.exports = { automodRegister }