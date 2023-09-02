const { ChannelType, EmbedBuilder } = require('discord.js');
const { logsEmiter } = require('../function/logs');
const { options } = require('../config/settings.json');

const createThreadOnJoin = async (channel, threadChannel, user) => {
    try {
        const thread = await threadChannel.threads.create({
            name: `Voice : ${channel.name}`,
            autoArchiveDuration: 60,
            reason: `Dedicated text channel for the voice channel ${channel.name}`,
            type: ChannelType.PrivateThread,
        });
        await thread.members.add(user);
        const embed = new EmbedBuilder()
                            .setColor(options.color)
                            .setDescription(`<@${user}> tu as rejoint un salon vocal 🎙️`);
        const message = await thread.send({ embeds: [embed, embedExplicative] });
    }
    catch(error) { logsEmiter(`An error occured\r\n ${error}`); }
}

const joinThreadOnJoin = async (channel, threadChannel, user) => {
    try {
        const thread = threadChannel.threads.cache.find(thread => thread.name === `Voice : ${channel.name}`);
        await thread.members.add(user);
        const embed = new EmbedBuilder()
                            .setColor(options.color)
                            .setDescription(`<@${user}> a rejoint le salon vocal 🎙️`);
        const message = await thread.send({ embeds: [embed] });
    }
    catch(error) { logsEmiter(`An error occured\r\n ${error}`); }
}

const leaveThreadOnLeave = async (channel, threadChannel, user) => {
    try {
        const thread = threadChannel.threads.cache.find(thread => thread.name === `Voice : ${channel.name}`);
        await thread.members.remove(user);
        const embed = new EmbedBuilder()
                            .setColor(options.color)
                            .setDescription(`<@${user}> a quitter ce salon vocal 💨`);
        const message = await thread.send({ embeds: [embed] });
    }
    catch(error) { logsEmiter(`An error occured\r\n ${error}`); }
}

const deleteThreadOnLeave = async (channel, threadChannel) => {
    try {
        const thread = threadChannel.threads.cache.find(thread => thread.name === `Voice : ${channel.name}`);
        await thread.delete();
    }
    catch(error) { logsEmiter(`An error occured\r\n ${error}`); }
}

const embedExplicative = new EmbedBuilder()
                                .setColor(options.color)
                                .setTitle('Channel vocal dédié')
                                .setDescription(`Ce salon dédié à votre vocal sera supprimé une fois tout le monde partie.
                                                Toutes les personnes qui quittent le salon vocal sont automatiquement kick de ce salon dédié`);

module.exports = { createThreadOnJoin, joinThreadOnJoin, leaveThreadOnLeave, deleteThreadOnLeave }