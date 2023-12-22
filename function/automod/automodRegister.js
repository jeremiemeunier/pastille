const { logs } = require('../logs');
const { BOT_ID } = require('../../config/secret.json');
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
            headers: {
                "pastille_botid": BOT_ID
            },
            data: {
                user_id: userId,
                reason: reason,
                date: today,
                guild_id: guildItem.id
            }
        });
        
        // On vérifie le nombre de warn
        try {
            const totalWarnUser = await axios({
                method: "get",
                url: "/infraction/all",
                headers: {
                    "pastille_botid": BOT_ID
                },
                params: {
                    user_id: userId,
                }
            });

            automodSanction(user, totalWarnUser, guildItem);
        }
        catch(error) { logs("error", "automod:get:infractions", error); }
    }
    catch(error) { logs("error", "automod:register", error); }
}

module.exports = { automodRegister }