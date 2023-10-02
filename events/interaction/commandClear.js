const { Events } = require('discord.js');
const { logsEmiter } = require('../../function/logs');
const { options } = require ('../../config/settings.json');

let client;

const commandClearInit = (clientItem) => {

    client = clientItem;

    client.on(Events.InteractionCreate, async interaction => {
        if (!interaction.isChatInputCommand()) return;
        const { commandName } = interaction;

        if(commandName === 'clearthreads') {
            const interactChannel = client.channels.cache.find(channel => channel.id === interaction.channelId);
            const threadsMap = interactChannel.threads.cache;

            await threadsMap.map(thread => {
                thread.delete();
            });

            interaction.reply({ content: `Tout les threads ont été supprimés`, ephemeral: true });
        }
        else if(commandName === 'clearmessages') {
            const interactChannel = client.channels.cache.find(channel => channel.id === interaction.channelId);

            await interactChannel.messages.fetch().then(messages => {
                messages.map(message => { message.delete(); });
            });

            interaction.reply({ content: `Tout les messages ont été supprimés`, ephemeral: true });
        }
    });
}

module.exports = { commandClearInit };