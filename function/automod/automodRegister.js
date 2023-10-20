const { logsEmiter } = require('../logs');
const { PORT, BOT_ID } = require('../../config/secret.json');
const axios = require('axios');
const { automodSanction } = require('./automodSanction');

const automodRegister = async (user, reason, guildItem) => {
    const userId = user.user.id;
    const today = new Date();

    // On créer un nouveau register
    try {
        const addNewInfraction = await axios({
            method: "post",
            url: "/infraction",
            baseURL: `http://localhost:${PORT}`,
            headers: {
                "pastille_botid": BOT_ID
            },
            data: {
                user_id: userId,
                reason: reason,
                date: today
            }
        });
        
        // On vérifie le nombre de warn
        try {
            const totalWarnUser = await axios({
                method: "get",
                url: "/infraction/all",
                baseURL: `http://localhost:${PORT}`,
                headers: {
                    "pastille_botid": BOT_ID
                },
                params: {
                    user_id: userId,
                }
            });

            automodSanction(user, totalWarnUser, guildItem);
        }
        catch(error) { logsEmiter(error); }
    }
    catch(error) { logsEmiter(error); }
}

module.exports = { automodRegister }