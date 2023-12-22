const { Events } = require('discord.js');
const { logs } = require('../../../function/logs');

let client;

const commandClearInit = (clientItem) => {

    client = clientItem;

    client.on(Events.InteractionCreate, async interaction => {
        if (!interaction.isChatInputCommand()) return;
        const { commandName } = interaction;

        if(commandName === 'clearthreads') {
            const interactChannel = client.channels.cache.find(channel => channel.id === interaction.channelId);
            const threadsMap = interactChannel.threads.cache;

            threadsMap.map(thread => {
                try {
                    thread.delete();
                }
                catch(error) { logs("error", "command:clear:threads", error); }
            });

            interaction.reply({ content: `Tout les threads ont été supprimés`, ephemeral: true });
        }
        else if(commandName === 'clearmessages') {
            const interactChannel = client.channels.cache.find(channel => channel.id === interaction.channelId);

            interactChannel.messages.fetch().then(messages => {
                messages.map(message => {
                    try {
                        message.delete();
                    }
                    catch(error) { logs("error", "command:clear:messages", error); }
                });
            });

            interaction.reply({ content: `Tout les messages ont été supprimés`, ephemeral: true });
        }
    });
}

module.exports = { commandClearInit };