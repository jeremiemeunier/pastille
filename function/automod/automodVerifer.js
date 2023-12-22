const { moderation } = require('../../config/settings.json');
const { logs } = require('../logs');
const { BOT_ID } = require('../../config/secret.json');
const axios = require("axios");

const automodVerifier = async (clientItem) => {
    const client = clientItem;
    const now = Date.parse(new Date());
    const { muted } = moderation.roles;

    logs("infos", "automod:verifier", 'Start sanctions verifications');
    
    try {
        const allSanctions = await axios({
            method: "get",
            url: "/sanction",
            headers: {
                "pastille_botid": BOT_ID
            }
        });

        if(allSanctions) {
            const { items } = allSanctions.data;
            
            items.map(async (item, index) => {
                const { sanction, user_id, guild_id } = item;
                const ending = Date.parse(new Date(sanction.ending));

                const guild = client.guilds.cache.find(guild => guild.id === guild_id);
                const user = await client.users.fetch(user_id);
                // const sanctionRole = guild.roles.cache.find(role => role.id === muted);

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
                else { logs(`User not find [${user_id}]`); }
            })
        }
        else { logs('No sanction in database'); }
    }
    catch(error) { logs(error); }

    logs("infos", "automod:verifier", 'End sanctions verifications');
}

module.exports = { automodVerifier }