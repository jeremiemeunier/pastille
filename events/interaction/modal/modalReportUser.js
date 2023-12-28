const { EmbedBuilder } = require('discord.js');
const { logs } = require('../../../function/logs');
const { getParams } = require('../../../function/base');

const modalReportUser = async (client, interaction) => {
  if(interaction.customId !=="modalReportUser" ) { return; }

  const guild = client.guilds.cache.find(guild => guild.id === interaction.guildId);
  const guildParams = await getParams(guild);
  const { moderation } = guildParams;

  const reportChannel = guild.channels.cache.find(channel => channel.id === moderation.channels.report);
  const reporterUser = guild.members.cache.find(user => user.id === interaction.user.id);
  const reportedUser = guild.members.cache.find(user => user.id === interaction.fields.getTextInputValue("reportedUser"));
  const shortReportReason = interaction.fields.getTextInputValue("shortReportReason");
  const largeReportReason = interaction.fields.getTextInputValue("largeReportReason");

  try {
    const reportEmbed = new EmbedBuilder({
      color: parseInt("FF0000", 16),
      description: `**Description rapide** :\r\n${shortReportReason}\r\n\r\n**Informations supplémentaires** :\r\n${largeReportReason}`,
      fields: [
        { name: "Signalement par", value: `<@${reporterUser.id}>`, inline: true },
        { name: "Signalement de", value: `<@${reportedUser.id}>`, inline: true },
      ]
    });
    await reportChannel.send({
      content: `<@&${moderation.roles.staff}> nouveau signalement d'un utilisateur`,
      embeds: [reportEmbed] });
    await interaction.reply({ content: "Votre signalement à bien été transmis à la modération" });
  }
  catch(error) {
    await interaction.reply({ content: "Une erreur est survenue lors du signalement veuillez réessayer plus tard." });
    logs("error", "context:report_user", error, guild.id);
  }
}

module.exports = { modalReportUser }