const { ChannelType, EmbedBuilder } = require('discord.js');

const createThreadOnJoin = async (channel, threadChannel, user) => {
    try { const thread = await threadChannel.threads.create({
            name: `Voice : ${channel.name}`,
            autoArchiveDuration: 60,
            reason: `Voice : ${channel.name}`,
            type: ChannelType.PrivateThread,
        });
        await thread.members.add(user);
        const embed = new EmbedBuilder()
                            .setColor('#20A68E')
                            .setDescription(`<@${user}> tu as rejoint un salon vocal 🎙️`);
        const message = await thread.send({ embeds: [embed, embedExplicative] });
    }
    catch(error) { console.log('An error occured', error); }
}

const joinThreadOnJoin = async (channel, threadChannel, user) => {
    try {
        const thread = threadChannel.threads.cache.find(thread => thread.name === `Voice : ${channel.name}`);
        await thread.members.add(user);
        const embed = new EmbedBuilder()
                            .setColor('#20A68E')
                            .setDescription(`<@${user}> a rejoint le salon vocal 🎙️`);
        const message = await thread.send({ embeds: [embed] });
    }
    catch(error) { console.log('An error occured', error); }
}

const leaveThreadOnLeave = async (channel, threadChannel, user) => {
    try {
        const thread = threadChannel.threads.cache.find(thread => thread.name === `Voice : ${channel.name}`);
        await thread.members.remove(user);
        const embed = new EmbedBuilder()
                            .setColor('#20A68E')
                            .setDescription(`<@${user}> a quitter ce salon vocal 💨`);
        const message = await thread.send({ embeds: [embed] });
    }
    catch(error) { console.log('An error occured', error); }
}

const deleteThreadOnLeave = async (channel, threadChannel) => {
    try {
        const thread = threadChannel.threads.cache.find(thread => thread.name === `Voice : ${channel.name}`);
        await thread.delete();
    }
    catch(error) { console.log('An error occured', error); }
}

const embedExplicative = new EmbedBuilder()
                                .setColor('#20A68E')
                                .setTitle('Channel vocal dédié')
                                .setDescription(`Ce salon dédié à votre vocal sera supprimé une fois tout le monde partie.
                                                Toutes les personnes qui quittent le salon vocal sont automatiquement kick de ce salon dédié`);

module.exports = { createThreadOnJoin, joinThreadOnJoin, leaveThreadOnLeave, deleteThreadOnLeave, embedExplicative }