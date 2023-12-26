const { Events } = require('discord.js');
const { logs } = require('../../../function/logs');
const { getParams } = require('../../../function/base');

const buttonOpenTicketInit = async (client, interaction) => {
  const { customId } = interaction;
  if(customId !== "closeTicket") { return; }

  const guildParams = await getParams(interaction.guild);
  const { moderation } = guildParams;

  const guild = client.guilds.cache.find(guild => guild.id === interaction.guildId);
  const member = guild.members.cache.find(member => member.id === interaction.user.id);
  const channel = await guild.channels.fetch(interaction.channelId);

  if(!member.roles.cache.has(moderation.roles.staff)) {
    await interaction.reply({ content: "Seul les membres du staff peuvent fermer un ticket", ephemeral: true });
    return;
  }

  try {
    channel.setLocked(true);
    await interaction.reply({ content: "Channel, now lock", ephemeral: true });
  }
  catch(error) { logs("error", "close:staff:channel", error, guild.id); }
}

module.exports = { buttonOpenTicketInit }