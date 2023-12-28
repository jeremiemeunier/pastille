const { Events, EmbedBuilder } = require('discord.js');
const { logs } = require('../../../function/logs');
const { getParams } = require('../../../function/base');

const contextReportUser = async (client, interaction) => {
  const { commandName } = interaction;
  if(commandName !== "Signaler l'utilisateur") { return; }

  const guild = client.guilds.cache.find(guild => guild.id === interaction.commandGuildId);
  const guildParams = await getParams(guild);
  const { moderation } = guildParams;

  const targetUser = guild.members.cache.find(member => member.id === interaction.targetId);
  const reportUser = guild.members.cache.find(member => member.id === interaction.user.id);
  const reportChannel = guild.channels.cache.find(channel => channel.id === moderation.channels.report);

  try {
    const reportEmbed = new EmbedBuilder({
      color: parseInt("FF0000", 16),
      description: "Signalement d'un utilisateur",
      fields: [
        { name: "Signalement par", value: `<@${reportUser.id}>`, inline: true },
        { name: "Signalement de", value: `<@${targetUser.id}>`, inline: true },
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

module.exports = { contextReportUser }