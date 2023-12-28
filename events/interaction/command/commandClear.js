const { Events } = require('discord.js');
const { logs } = require('../../../function/logs');

const commandClearInit = async (client, interaction) => {
  const { commandName } = interaction;
  if(commandName !== "clear") { return; }

  if(interaction.options.getSubcommand() === 'thread') {
    const interactChannel = client.channels.cache.find(channel => channel.id === interaction.channelId);
    const threadsMap = interactChannel.threads.cache;

    await threadsMap.map(async (thread) => {
      try { await thread.delete(); }
      catch(error) { logs("error", "command:clear:threads", error); }
    });

    interaction.reply({ content: `Tout les threads ont été supprimés`, ephemeral: true });
  }
  
  if(interaction.options.getSubcommand() === 'messages') {
    const interactChannel = client.channels.cache.find(channel => channel.id === interaction.channelId);

    await interactChannel.messages.fetch().then((messages) => {
      messages.map(async (message) => {
        try { await message.delete(); }
        catch(error) { logs("error", "command:clear:messages", error); }
      });
    });

    interaction.reply({ content: `Tout les messages ont été supprimés`, ephemeral: true });
  }
}

module.exports = { commandClearInit };