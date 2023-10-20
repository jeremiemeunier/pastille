const { moderation } = require('../../config/settings.json');
const { logsEmiter } = require('../logs');
const { PORT, BOT_ID } = require('../../config/secret.json');
const axios = require("axios");

const automodSanction = (user, size, guild) => {
    const { sanctions } = moderation;
    const today = Date.parse(new Date());

    if(
        size === 3 ||
        size === 6 ||
        size === 9) {
        // Sanction temporaire de mute
        const { low } = sanctions;
        const duration = durationInterpreter(low)
        const startTime = new Date();
        const endTime = new Date(Date.parse(new Date()) + duration);

        sanctionApplier(user, duration, guild);
        sanctionRegister(user.user.id, 'low', startTime, endTime);
    }
    else if(
        size === 12 ||
        size === 15 ||
        size === 18
    ) {
        // Sanction temporaire de mute
        const { medium } = sanctions;
        const duration = durationInterpreter(medium)
        const startTime = new Date();
        const endTime = new Date(Date.parse(new Date()) + duration);

        sanctionApplier(user, duration, guild);
        sanctionRegister(user.user.id, 'medium', startTime, endTime);
    }
    else if(
        size === 21 ||
        size === 24 ||
        size === 27
    ) {
        // Sanction temporaire de mute
        const { hight } = sanctions;
        const duration = durationInterpreter(hight)
        const startTime = new Date();
        const endTime = new Date(Date.parse(new Date()) + duration);

        sanctionApplier(user, duration, guild);
        sanctionRegister(user.user.id, 'hight', startTime, endTime);
    }
    else if(size > 27) {
        
    }
}

const durationInterpreter = (sanctionData) => {
    const { duration, unit } = sanctionData;

    if (unit === 'm') { return duration * (1000 * 60); }
    else if (unit === 'h') { return duration * (1000 * 3600); }
    else if (unit === 'd') { return duration * (1000 * 3600 * 24); }
}

const sanctionRegister = async (userId, level, start, end) => {
    try {
        const register = await axios({
            method: "post",
            url: "/sanction",
            baseURL: `http://localhost:${PORT}`,
            headers: {
                "pastille_botid": BOT_ID
            },
            data: {
                user_id: userId,
                level: level,
                date: start,
                end: end
            }
        });
    }
    catch(error) { logsEmiter(error); }
}

const sanctionApplier = (user, duration, guild) => {
    const sanctionRole = guild.roles.cache.find(role => role.id === moderation.roles.muted);
    user.roles.add(sanctionRole);

    setTimeout(() => {
        user.roles.remove(sanctionRole);
    }, duration);
}

module.exports = { automodSanction }