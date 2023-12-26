const { Events, EmbedBuilder } = require('discord.js');
const { logs } = require('../../../function/logs');
const { getParams } = require('../../../function/base');

const commandAnnounceInit = async (client) => {
  client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) { return; }
    const { commandName } = interaction;

    const guildParams = await getParams(interaction.guild);
    const { options } = guildParams;
    
    if(commandName === 'announce') {
      try {
        const embed = new EmbedBuilder({
          color: parseInt(options.color, 16),
          title: interaction.options.getString('title'),
          description: interaction.options.getString('content'),
        });
        const message = await interaction.reply({
          embeds: [embed], fetchReply: true, content: "📢 **Annonce** ||@everyone||" });
      }
      catch(error) { logs("error", "command:announce", error); }
    }
  });
}

module.exports = { commandAnnounceInit }