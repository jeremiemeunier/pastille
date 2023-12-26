const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder } = require('discord.js');
const { logs } = require('../../../function/logs');
const { getParams } = require('../../../function/base');

const lockableThread = async (thread, guild) => {
  const guildParams = await getParams(guild);
  const { options } = guildParams;

  if(!thread.locked) {
    try {
      const lockButton = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder({
            label: "Fermer le ticket",
            style: ButtonStyle.Primary,
            custom_id: "closeTicket"
          }));
      return lockButton;
    }
    catch(error) { logs("error", "reaction:thread:lock", error); return false; }
  }
  else {
    try {
      const unlockButton = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder({
            label: "Réouvrir le ticket",
            style: ButtonStyle.Primary,
            custom_id: "openTicket"
          }));
      return unlockButton;
    }
    catch(error) { logs("error", "reaction:thread:lock", error); return false; }
  }
}

const buttonStaffRequest = async (client, interaction) => {
  const { customId } = interaction;
  if (customId !== "requestStaff") { return; }
  
  const guild = client.guilds.cache.find(guild => guild.id === interaction.guildId);
  const member = guild.members.cache.find(member => member.id === interaction.user.id);
  const channel = guild.channels.cache.find(channel => channel.id === interaction.channelId);

  const guildParams = await getParams(guild);
  const { options, moderation } = guildParams;

  const activeRequest = channel.threads.cache.find(
    thread => thread.name === `Ticket pour ${member.user.username}` && thread.locked === false);

  if(activeRequest) {
    await interaction.reply({ content: `Une demande est déjà en cours. ${activeRequest}`, ephemeral: true });
    return;
  }
  
  try {
    const staffThread = await channel.threads.create({
      name: `Ticket pour ${member.user.username}`,
      autoArchiveDuration: 60,
      reason: `Create thread contact staff for ${member.user.username}`,
      type: ChannelType.PrivateThread,
      invitable: false,
    });

    const staffCall = new EmbedBuilder({
      color: parseInt(options.color, 16),
      title: "Nouvelle demande de contact",
      description: `<@&${moderation.roles.staff}> nouvelle demande de **__${member.user.username}__**`
    });
    const lockButton = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder({
        label: "Fermer le ticket",
        style: ButtonStyle.Primary,
        custom_id: "closeTicket"
      }));

    await staffThread.send({ embeds: [staffCall], components: [lockButton] });
    if(await lockableThread(staffThread, guild)) {
      await staffThread.members.add(member.id);
      await interaction.reply({
        content: `Ta demande de contact à été créée. Tu as maintenant accès au fil ${staffThread}`, ephemeral: true });
    }
    else {
      try { await staffThread.delete(); }
      catch(error) { logs("error", "staff:thread:delete", error, guild.id); }
    }
  }
  catch(error) {
    logs("error", "staff:button:thread", error, guild.id);
    await interaction.reply({ content: `Une erreur s'est produite.`, ephemeral: true });
  }
}

module.exports = { buttonStaffRequest }