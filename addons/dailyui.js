const { EmbedBuilder } = require('discord.js');
const { options } = require('../config/settings.json');
const { logsEmiter } = require('../function/logs');
const { GUILD_ID, PORT, BOT_ID } = require('../config/secret.json');
const axios = require('axios');

let client;

const addonsLoaded = async (clientItem, addonsParamsItem) => {
    
    client = clientItem;
    const { channel, role, options, name } = addonsParamsItem;
    const { hours, minutes } = options;

    setInterval(async () => {
        const actualDate = new Date();

        if(
            actualDate.getHours().toString() === hours && 
            actualDate.getMinutes().toString() === minutes) {
            try {
                const dailyUiChallenge = await axios({
                    method: 'get',
                    url: '/dailyui',
                    baseURL: `http://localhost:${PORT}`,
                    headers: {
                        "pastille_botid": BOT_ID
                    }
                });

                const { _id, title, description } = dailyUiChallenge.data.data;
                const guild = client.guilds.cache.find(guild => guild.id === GUILD_ID);
                const addonsChannel = guild.channels.cache.find(addonsChannel => addonsChannel.name === channel);

                try {
                    const embed = new EmbedBuilder()
                        .setColor(options.color)
                        .setTitle(`**${title}**`)
                        .setDescription(`${description}`);
                    const message = await addonsChannel.send({
                        content: `<@&${role}> c'est l'heure du DailyUi ! N'hésitez pas à partager vos créations dans le fils`,
                        embeds: [embed]
                    });

                    // On crée le thread lié au message
                    // On change aussi le topic du channel
                    try {
                        addonsChannel.setTopic(`**DailyUi → ${title}** | ${description}`);
                        const thread = await message.startThread({
                            name: `${title}`,
                            autoArchiveDuration: 60,
                            reason: 'Need a separate thread for daily dailyui'
                        });

                        try {
                            const dailyUiChallenge = await axios({
                                method: 'put',
                                url: '/dailyui',
                                baseURL: `http://localhost:${PORT}`,
                                headers: { "pastille_botid": BOT_ID },
                                params: { id: _id }
                            });
                        }
                        catch(error) { logsEmiter(`Addons [${name}] : ⚠️  | Update DailyUi Challenge | ${error}`); }
                    }
                    catch(error) { logsEmiter(`Addons [${name}] : ⚠️  | Creating thread and update topic | ${error}`); }
                }
                catch(error) { logsEmiter(`Addons [${name}] : ⚠️  | Request challenge | ${error}`); }
            }
            catch(error) { logsEmiter(`Addons [${name}] : ⚠️  | ${error}`); }
        }
    }, 60000);
}

module.exports = { addonsLoaded }