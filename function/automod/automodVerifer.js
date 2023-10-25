const { moderation } = require('../../config/settings.json');
const { logsEmiter } = require('../logs');
const { PORT, BOT_ID } = require('../../config/secret.json');
const axios = require("axios");

const automodVerifier = async (clientItem) => {
    const client = clientItem;
    const now = Date.parse(new Date());
    
    try {
        const allSanctions = await axios({
            method: "get",
            url: "/sanction",
            baseURL: `http://localhost:${PORT}`,
            headers: {
                "pastille_botid": BOT_ID
            }
        });

        if(allSanctions) {
            const { items } = allSanctions.data;
            
            items.map((item, index) => {
                const { sanction, user_id, guild_id } = item;
                const ending = Date.parse(new Date(sanction.ending));

                const guild = client.guilds.cache.find(guild => guild.id === guild_id);
                const user = guild.members.cache.find(user => user.id === user_id);

                if(user) {
                    if(ending <= now) {

                    }
                    else {
                        const newTimer = ending - now;
    
                        setTimeout(() => {
                            console.log('finito');
                        }, newTimer);
                    }
                }
                else { logsEmiter(`User not find [${user_id}]`); }
            })
        }
        else { logsEmiter('No sanction in database'); }
    }
    catch(error) { logsEmiter(error); }
}

module.exports = { automodVerifier }