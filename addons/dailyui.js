const fs = require('node:fs');
const { EmbedBuilder } = require('discord.js');
const { options } = require('../config/settings.json');
const { logsEmiter } = require('../function/logs');
const { GUILD_ID } = require('../config/secret.json');

let client;

const addonsLoaded = async (clientItem, addonsParamsItem) => {
    
    client = clientItem;
    const { channel, role } = addonsParamsItem;
    const dailyUiList = JSON.parse(fs.readFileSync('./config/addons/dailyui.json'));

    setInterval(async () => {
        const actualDate = new Date();

        if(actualDate.getHours() === 9 && actualDate.getMinutes() === 33) {
            let dailyUiAvancement = fs.readFileSync('./bin/dailyui.txt', 'utf8', (err, data) => {
                if(err) { console.log(err); }
                else { return data; }
            });
            let nextDailyUiAdvancement = fs.readFileSync('./bin/dailyui.txt', 'utf8', (err, data) => {
                if(err) { console.log(err); }
                else { return data; }
            });
            nextDailyUiAdvancement++;

            try {
                const guild = client.guilds.cache.find(guild => guild.id === GUILD_ID);
                const addonsChannel = guild.channels.cache.find(addonsChannel => addonsChannel.name === channel);
                const embed = new EmbedBuilder()
                    .setColor(options.color)
                    .setTitle(`C'est l'heure de ton dailyUi !`)
                    .setDescription(`Pour aujourd'hui : **${dailyUiList[dailyUiAvancement].name}**`);
                const message = await addonsChannel.send({
                    content: `<@&${role}> c'est l'heure du DailyUi ! N'hésitez pas à partager vos créations dans le fils`,
                    embeds: [embed]
                });
                try {
                    addonsChannel.setTopic(`DailyUi → ${dailyUiList[dailyUiAvancement].name}`);
                    const thread = await message.startThread({
                        name: `${dailyUiList[dailyUiAvancement].name}`,
                        autoArchiveDuration: 60,
                        reason: 'Need a separate thread for daily dailyui'
                    });
                    fs.writeFileSync('./bin/dailyui.txt', nextDailyUiAdvancement.toString());
                }
                catch(error) { console.log(error); }
            }
            catch(error) { console.log(error); }
        }
    }, 60000);
}

module.exports = { addonsLoaded }