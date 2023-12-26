const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { logs } = require('../../../function/logs');
const { getParams } = require('../../../function/base');

const commandStaffInit = async (client) => {
  client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const { commandName } = interaction;

    const guildParams = await getParams(interaction.guild);
    const { options } = guildParams;
    
    if(commandName === 'staff') {
      try {
        const requestStaffButton = new ActionRowBuilder().addComponents(
          new ButtonBuilder({
            label: "Contacter le staff",
            style: ButtonStyle.Primary,
            custom_id: "requestStaff"
          })
        );
        const embed = new EmbedBuilder({
          color: parseInt(options.color, 16),
          title: "Demande de support",
          description: "Comment pouvons-nous t'aider ? Si tu as des questions ou des demandes clique sur le bouton pour contacter le staff"
        });
        const message = await interaction.reply({
          embeds: [embed],
          components: [requestStaffButton],
          fetchReply: false });
      }
      catch(error) { logs("error", "command:staff", error, interaction.guildId); }
    }
  });
}

module.exports = { commandStaffInit }