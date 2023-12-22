const { ChannelType, EmbedBuilder } = require('discord.js');
const { logs } = require('../function/logs');
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
    catch(error) { logs("error", "voice:thread:create", error); }
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
    catch(error) { logs("error", "voice:thread:join", error); }
}

const leaveThreadOnLeave = async (channel, threadChannel, user) => {
    try {
        const thread = threadChannel.threads.cache.find(thread => thread.name === `Voice : ${channel.name}`);
        await thread.members.remove(user);
        const embed = new EmbedBuilder()
            .setColor(options.color)
            .setDescription(`<@${user}> a quitté ce salon vocal 💨`);
        const message = await thread.send({ embeds: [embed] });
    }
    catch(error) { logs("error", "voice:thread:leave", error); }
}

const deleteThreadOnLeave = async (channel, threadChannel) => {
    try {
        const thread = threadChannel.threads.cache.find(thread => thread.name === `Voice : ${channel.name}`);
        await thread.delete();
    }
    catch(error) { logs("error", "voice:thread:delete", error); }
}

const embedExplicative = new EmbedBuilder()
    .setColor(options.color)
    .setTitle('Fil vocal dédié')
    .setDescription(`Ce salon est dédié à votre channel vocal actuel.\r\n - Il sera automatiquement surpprimer une fois que tout le monde aura quitter le channel.\r\n- Chaque personne qui rejoijd  est automatiquement ajoutée au fil.\r\n- Chaque personne qui quitte le channel vocal est retirer du fil automatiquement.`);

module.exports = { createThreadOnJoin, joinThreadOnJoin, leaveThreadOnLeave, deleteThreadOnLeave }