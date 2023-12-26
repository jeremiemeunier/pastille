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
  const role = guild.roles.cache.find(role => role.id === moderation.roles.rule);

  console.log(interaction);
}

module.exports = { buttonOpenTicketInit }