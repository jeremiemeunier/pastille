const fs = require('node:fs');
const { Events, ChannelType, EmbedBuilder } = require('discord.js');
const { logsEmiter } = require('../function/logs');
const { channels, options, moderation } = require ('../config/settings.json');

const roleSettings = JSON.parse(fs.readFileSync('./data/role.json'));

let client;

const reactionAddEventInit = (clientItem) => {

    client = clientItem;

    client.on(Events.MessageReactionAdd, async (reaction, user) => {
        if(user.bot === true) { return; }
        else {
            const helpZone = client.channels.cache.find(channel => channel.id === channels.help);
            if (reaction.partial) {
                try { await reaction.fetch(); }
                catch (error) { logsEmiter(`An error occured on fetch\r\n ${error}`); return; }
            }
    
            if(reaction.message.interaction != undefined) {
                if(reaction.message.interaction.commandName === 'rule') {
                    if(reaction.emoji.name === options.reaction.rule) {
                        const guild = client.guilds.cache.find(guild => guild.id === reaction.message.guildId);
                        const member = guild.members.cache.find(member => member.id === user.id);
                        const role = guild.roles.cache.find(role => role.id === moderation.roles.rule);
    
                        try { await member.roles.add(role); }
                        catch(error) { logsEmiter(`An error occured [reactionAddEventInit:rule] : \r\n ${error}`); return; }
                    }
                    else { reaction.users.remove(user); }
                }
                if(reaction.message.interaction.commandName === 'staff') {
                    if(reaction.emoji.name === options.reaction.ticket) {
                        try {
                            reaction.users.remove(user);
                            const thread = await helpZone.threads.create({
                                name: `@${user.username} request help`,
                                autoArchiveDuration: 60,
                                reason: `Requested help form @${user.username}`,
                                type: ChannelType.PrivateThread,
                            });
                            await thread.members.add(user);
                            const embed = new EmbedBuilder()
                                .setColor(`${options.color}`)
                                .setTitle(`Requested help from @${user.username}`)
                                .setDescription(`Pour mettre fin à ta demande d'aide clique sur 🔒`);
                            const message = await thread.send({ embeds: [embed] });
                            message.react('🔒');
                        }
                        catch(error) { logsEmiter(`An error occured [reactionAddEventInit:staff] : \r\n ${error}`); return; }
                    }
                    else { reaction.users.remove(user); }
                }
                if(reaction.message.interaction.commandName === 'role') {
                    for(let i = 0;i < roleSettings.length;i++) {
                        if(reaction.emoji.name === roleSettings[i].emoji) {
                            const guild = client.guilds.cache.find(guild => guild.id === reaction.message.guildId);
                            const member = guild.members.cache.find(member => member.id === user.id);
                            const role = guild.roles.cache.find(role => role.id === roleSettings[i].role);
    
                            try { await member.roles.add(role); }
                            catch(error) { logsEmiter(`An error occured [reactionAddEventInit:role] : \r\n ${error}`); return; }
                        }
                    }
                }
                if(reaction.message.interaction.commandName === 'poll') {
                    const userReactions = reaction.message.reactions.cache.filter(reaction => reaction.users.cache.has(user.id));
                    const botReactThis = reaction.users.cache.find(user => user.bot === true);
    
                    if(botReactThis === undefined) {
                        try { await reaction.users.remove(user); }
                        catch(error) { logsEmiter(`An error occured [reactionAddEventInit:poll] : \r\n ${error}`); return; }
                    }
                    else {
                        userReactions.map(async (react) => {
                            if(react.emoji.name !== reaction.emoji.name) {
                                try { await react.users.remove(user); }
                                catch(error) { logsEmiter(`An error occured [reactionAddEventInit:poll2] : \r\n ${error}`); return; }
                            }
                        });
                    }
                }
            }
            else {
                if(reaction.emoji.name === '🔒') {
                    const channel = client.channels.cache.find(channel => channel.id === channels.help);
                    const thread = channel.threads.cache.find(thread => thread.id === reaction.message.channelId);

                    try {
                        thread.setLocked(true);
                        const embed = new EmbedBuilder()
                            .setColor(`${options.color}`)
                            .addFields(
                                { name: "Suppression", value: 'Clique sur 🗑️ pour supprimer ce fil.', inline: true },
                                { name: "Déverouillage", value: 'Clique sur 🔓 pour débloquer ce fil.', inline: true })
                            .setDescription(`Ce fil est maintenant verrouillé.`);
                        const message = await thread.send({ embeds: [embed]});
                        message.react('🗑️');
                        message.react('🔓');
                    }
                    catch(error) { logsEmiter(`An error occured [reactionAddEventInit:staff:thread_close] : \r\n ${error}`); return; }
                }
                else if(reaction.emoji.name === '🗑️') {
                    const channel = client.channels.cache.find(channel => channel.id === channels.help);
                    const thread = channel.threads.cache.find(thread => thread.id === reaction.message.channelId);
                    const embed = new EmbedBuilder()
                                            .setColor(`${options.color}`)
                                            .setDescription(`Ce fil va être supprimé dans quelques secondes`);
                    const message = await thread.send({ embeds: [embed]});
    
                    setTimeout(async () => {
                        try { thread.delete(true); }
                        catch(error) { logsEmiter(`An error occured [reactionAddEventInit:staff:thread_delete] : \r\n ${error}`); return; }
                    }, 30000);
                }
                else if(reaction.emoji.name === '🔓') {
                    const channel = client.channels.cache.find(channel => channel.id === channels.help);
                    const thread = channel.threads.cache.find(thread => thread.id === reaction.message.channelId);
    
                    try {
                        thread.setLocked(false);
                        const embed = new EmbedBuilder()
                            .setColor(`${options.color}`)
                            .setDescription(`Ce fil est de nouveau disponible. Pour mettre fin à ta demande clique sur 🔒`);
                        const message = await thread.send({ embeds: [embed] });
                        message.react('🔒');
                    }
                    catch(error) { logsEmiter(`An error occured [reactionAddEventInit:staff:thread_open] : \r\n ${error}`); return; }
                }
                else if(reaction.emoji.name === '🤓') {
                    const guild = client.guilds.cache.find(guild => guild.id === reaction.message.guildId);
                    const member = guild.members.cache.find(member => member.id === user.id);
                    const role = guild.roles.cache.find(role => role.id === '1118500573675782235');
    
                    try { await member.roles.add(role); }
                    catch(error) { logsEmiter(`An error occured [reactionAddEventInit:dailyui] : \r\n ${error}`); return; }
                }
            }
        }
    });
}

module.exports = { reactionAddEventInit }