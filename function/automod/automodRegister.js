const { logsEmiter } = require('../logs');
const { PORT, BOT_ID } = require('../../config/secret.json');
const axios = require('axios');
const { automodSanction } = require('./automodSanction');

const automodRegister = async (user, warn, guildItem) => {
    const userId = user.user.id;
    const today = new Date();
    const newInfraction = { "warn": warn, "time": today };

    try {
        const requestExistInfraction = await axios({
            method: "get",
            url: "/infraction/user",
            baseURL: `http://localhost:${PORT}`,
            params: {
                user_id: userId
            },
            headers: {
                "pastille_botid": BOT_ID
            }
        });

        if(requestExistInfraction.data.userExist) {
            const warnsArray = requestExistInfraction.data.userData.warns;

            warnsArray.push(newInfraction);
            const warnsSize = warnsArray.length;

            if(warnsSize === 3 || warnsSize === 6 || warnsSize === 9 ||
               warnsSize === 12 || warnsSize === 15 || warnsSize === 18) {
                logsEmiter(`New sanction emitted for ${userId} → ${warnsSize}`);
                automodSanction(userId, warnsSize, guildItem);
            }

            try {
                const updateInfraction = await axios({
                    method: "put",
                    url: "/infraction",
                    baseURL: `http://localhost:${PORT}`,
                    headers: {
                        "pastille_botid": BOT_ID
                    },
                    data: {
                        user_id: userId,
                        warns: warnsArray
                    }
                });

                logsEmiter(`New warn added for ${userId}`);
            }
            catch(error) {
                logsEmiter(error);
                logsEmiter(error.data.message);
            }
        }
        else {
            logsEmiter(`User not exist : ${requestExistInfraction.data.userExist}`);
        }
    }
    catch(error) {
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
                    warns: [
                        newInfraction
                    ]
                }
            });
        }
        catch(error) {
            logsEmiter(error);
        }
    }
}

module.exports = { automodRegister }