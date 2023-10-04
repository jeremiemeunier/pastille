const { Events, EmbedBuilder } = require('discord.js');
const { logsEmiter } = require('../function/logs');
const { channels, options } = require ('../config/settings.json');

let client;

const messageCreateEventInit = (clientItem) => {
    client = clientItem;

    client.on(Events.MessageCreate, async (message) => {
        const content = message.content;
        const guild = client.guilds.cache.find(guild => guild.id === message.guildId);
        const channel = guild.channels.cache.find(channel => channel.id === message.channelId);
        const author = message.author.username;
        const today = new Date();
        const postedDate = `${today.getDay}/${today.getMonth}/${today.getFullYear}`;
        const msg = channel.messages.cache.find(message => message.id === message.id);
    
        let splitedMsg = content.split(' ');
        let cmd = splitedMsg.shift().slice(1);
        let text = splitedMsg.join(' ');
    
        if(message.author.bot === true) { return; }
        if(content.startsWith(options.bang)) {
            if(cmd === 'ip' || cmd === 'bichonwood') {
                message.delete();
                const embed = new EmbedBuilder()
                                        .setColor(`${options.color}`)
                                        .setTitle('Envie de nous rejoindre sur BichonWood ?')
                                        .setDescription(`Pour rejoindre le serveur créatif de BichonWood, tu doit faire une demande auprès d'un modérateur ou un admin.`)
                                        .addFields(
                                            { name: 'Version', value: '1.20.1', inline: true },
                                            { name: 'IP', value: 'minecraft.jeremiemeunier.fr', inline: true }
                                        );
                try { channel.send({ embeds: [embed] }); }
                catch(error) { logsEmiter(`An error occured [messageCreateEventInit:ip] : \r\n ${error}`); return; }
            }
            else if(cmd === 'dailyui') {
                message.delete();
                const embed = new EmbedBuilder()
                                        .setColor(`${options.color}`)
                                        .setTitle(`Tu souhaite t'exercer à l'UI/UX ?`)
                                        .setDescription(`Pour t'ajouter le rôle des DailyUi clique sur le 🤓`);
                try {
                    const message = await channel.send({ embeds: [embed] });
                    message.react('🤓');
                }
                catch(error) { logsEmiter(`An error occured [messageCreateEventInit:dailyui] : \r\n ${error}`); return; }
            }
        }
        else if(channel.name === channels.screenshots) {
            if(message.attachments.size) {
                try {
                    const thread = await message.startThread({
                        name: `${author} (${today.getDay()}/${today.getMonth() + 1}/${today.getFullYear()})`,
                        autoArchiveDuration: 60,
                        reason: 'New screenshots posted'
                    });
                }
                catch(error) { logsEmiter(`An error occured [screenshotPost] : \r\n ${error}`); return; }
            }
        }
        else { return; }
    });
}

module.exports = { messageCreateEventInit }