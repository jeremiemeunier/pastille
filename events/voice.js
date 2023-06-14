const { ChannelType, EmbedBuilder } = require('discord.js');
const { logger } = require('../function/base.js');

const createThreadOnJoin = async (channel, threadChannel, channelConsole, user) => {
    try { const thread = await threadChannel.threads.create({
            name: `Voice : ${channel.name}`,
            autoArchiveDuration: 60,
            reason: `Dedicated text channel for the voice channel ${channel.name}`,
            type: ChannelType.PrivateThread,
        });
        await thread.members.add(user);
        const embed = new EmbedBuilder()
                            .setColor('#20A68E')
                            .setDescription(`<@${user}> tu as rejoint un salon vocal 🎙️`);
        const message = await thread.send({ embeds: [embed, embedExplicative] });
    }
    catch(error) { logger(channelConsole, `An error occured\r\n ${error}`); }
}

const joinThreadOnJoin = async (channel, threadChannel, channelConsole, user) => {
    try {
        const thread = threadChannel.threads.cache.find(thread => thread.name === `Voice : ${channel.name}`);
        await thread.members.add(user);
        const embed = new EmbedBuilder()
                            .setColor('#20A68E')
                            .setDescription(`<@${user}> a rejoint le salon vocal 🎙️`);
        const message = await thread.send({ embeds: [embed] });
    }
    catch(error) { logger(channelConsole, `An error occured\r\n ${error}`); }
}

const leaveThreadOnLeave = async (channel, threadChannel, channelConsole, user) => {
    try {
        const thread = threadChannel.threads.cache.find(thread => thread.name === `Voice : ${channel.name}`);
        await thread.members.remove(user);
        const embed = new EmbedBuilder()
                            .setColor('#20A68E')
                            .setDescription(`<@${user}> a quitter ce salon vocal 💨`);
        const message = await thread.send({ embeds: [embed] });
    }
    catch(error) { logger(channelConsole, `An error occured\r\n ${error}`); }
}

const deleteThreadOnLeave = async (channel, threadChannel, channelConsole) => {
    try {
        const thread = threadChannel.threads.cache.find(thread => thread.name === `Voice : ${channel.name}`);
        await thread.delete();
    }
    catch(error) { logger(channelConsole, `An error occured\r\n ${error}`); }
}

const embedExplicative = new EmbedBuilder()
                                .setColor('#20A68E')
                                .setTitle('Channel vocal dédié')
                                .setDescription(`Ce salon dédié à votre vocal sera supprimé une fois tout le monde partie.
                                                Toutes les personnes qui quittent le salon vocal sont automatiquement kick de ce salon dédié`);

module.exports = { createThreadOnJoin, joinThreadOnJoin, leaveThreadOnLeave, deleteThreadOnLeave, embedExplicative }