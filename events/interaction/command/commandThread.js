const { ChannelType, Events, EmbedBuilder } = require('discord.js');
const { logs } = require('../../../function/logs');
const { options } = require('../../../config/settings.json');

let client;

const commandThreadInit = (clientItem) => {

    client = clientItem;

    client.on(Events.InteractionCreate, async interaction => {
        if (!interaction.isChatInputCommand()) return;
            const { commandName } = interaction;
        
        if(commandName === 'fils') {
            const channel = client.channels.cache.find(channel => channel.id === interaction.channelId);
    
            try {
                const thread = await channel.threads.create({
                    name: interaction.options.getString('title'),
                    autoArchiveDuration: 60,
                    reason: interaction.options.getString('title'),
                    type: ChannelType.PrivateThread,
                });
                await thread.members.add(interaction.user.id);
                await interaction.reply({ content: `Tu as maintenant accès au thread ${thread}`, ephemeral: true });
        
                let embed = new EmbedBuilder()
                                    .setColor(`${options.color}`)
                                    .setDescription(`Bienvenue sur ton thread dédié`);
                const msg = await thread.send({ embeds: [embed] });
            }
            catch(error) { logs("error", "command:thread", error); }
        }
    });
}

module.exports = { commandThreadInit }