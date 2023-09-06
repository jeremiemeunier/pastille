const { moderation } = require('../../config/settings.json');
const fs = require('node:fs');
const { logsEmiter } = require('../logs');

const automodSanction = (user, guild) => {
    const execFolder = __dirname;
    const binFolder = execFolder.replace('function/automod', 'bin/automod/');
    const sanctions = moderation.sanctions;
    const today = Date.parse(new Date());

    try {
        let warnList = JSON.parse(fs.readFileSync(`${binFolder}${user.user.id}.txt`, 'utf8', (error, data) => {
            if(error) { logsEmiter(`[automod:sanction] Reading file : ${error}`); }
        }));

        const warnSize = warnList.warns.length;
        const sanctionSize = warnList.sanctions.length;

        if(warnSize === 3) {
            warnList.sanctions.push({
                "level": "low",
                "duration": durationInterpreter(sanctions.low),
                time: today });
            sanctionApplier(user, durationInterpreter(sanctions.low), guild);
        }
        else if (warnSize === 6) {
            warnList.sanctions.push({
                "level": "medium",
                "duration": durationInterpreter(sanctions.medium),
                time: today });
            sanctionApplier(user, durationInterpreter(sanctions.medium), guild);
        }
        else if (warnSize === 9) {
            warnList.sanctions.push({
                "level": "hight",
                "duration": durationInterpreter(sanctions.hight),
                time: today });
            sanctionApplier(user, durationInterpreter(sanctions.hight), guild);
        }

        fs.writeFileSync(`${binFolder}${user.user.id}.txt`, JSON.stringify(warnList), (error) => {
            if(error) { logsEmiter(`[automod:sanction] Writting file : ${error}`); }
        });
    }
    catch(error) {
        logsEmiter(`[automod:sanction] No file : ${error}`);
    }
}

const durationInterpreter = (sanctionData) => {
    const duration = sanctionData.duration;
    const unit = sanctionData.unit;

    if (unit === 'm') { return duration * (1000 * 60); }
    else if (unit === 'h') { return duration * (1000 * 3600); }
    else if (unit === 'd') { return duration * (1000 * 3600 * 24); }
}

const sanctionApplier = (user, duration, guild) => {
    const sanctionRole = guild.roles.cache.find(role => role.id === moderation.roles.muted);

    user.roles.add(sanctionRole);

    setTimeout(() => {
        user.roles.remove(sanctionRole);
    }, duration);
}

module.exports = { automodSanction }