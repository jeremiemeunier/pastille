const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { logs } = require('../../../function/logs');
const { getParams } = require('../../../function/base');

const contextReportMessage = async (client, interaction) => {
  const { commandName } = interaction;
  if(commandName !== "Signaler le message") { return; }

  const guild = client.guilds.cache.find(guild => guild.id === interaction.guildId);
  const guildParams = await getParams(guild);
  const { moderation } = guildParams;

  const reporterUser = guild.members.cache.find(user => user.id === interaction.user.id);
  const reportedChannel = guild.channels.cache.find(channel => channel.id === interaction.channelId);
  const reportedMessage = reportedChannel.messages.cache.find(message => message.id === interaction.targetId);
  const reportChannel = guild.channels.cache.find(channel => channel.id === moderation.channels.report);

  try {
    const reportEmbed = new EmbedBuilder({
      color: parseInt("FF0000", 16),
      description: `**Message** :\r\n\`\`\`${reportedMessage.content}`,
      fields: [
        { name: "Auteur", value: `<@${reportedMessage.author.id}>` },
        { name: "Signalement par", value: `<@${reporterUser.id}>` }
      ]
    });
    const buttonDelete = new ActionRowBuilder().addComponents(
      new ButtonBuilder({
        label: "Supprimer le message",
        style: ButtonStyle.Danger,
        custom_id: "deleteReportedMessage"
    }));
    const warnUser = new ActionRowBuilder().addComponents(
      new ButtonBuilder({
        label: "Ajouter un warn à l'auteur",
        style: ButtonStyle.Secondary,
        custom_id: "warnReportedMessageUser"
    }));

    await reportChannel.send({
      content: `<@&${moderation.roles.staff}> nouveau signalement d'un message :`,
      embeds: [reportEmbed],
      components: [buttonDelete, warnUser]
    });
    await interaction.reply({ content: "Le signalement à bien été transmis à l'équipe de modération", ephemeral: true });
  }
  catch(error) { logs("error", "command:report:message", error, guild.id); }
}

module.exports = { contextReportMessage }