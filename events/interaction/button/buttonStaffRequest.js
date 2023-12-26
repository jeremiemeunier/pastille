const { Events, ChannelType, EmbedBuilder } = require('discord.js');
const { logs } = require('../../../function/logs');
const { getParams } = require('../../../function/base');

const buttonStaffRequest = (client) => {
  client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isButton()) return;
    const { customId } = interaction;
    
    if(customId === 'requestStaff') {
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
        });

        const staffCall = new EmbedBuilder({
          color: parseInt(options.color, 16),
          title: "Nouvelle demande de contact",
          description: `<@&${moderation.roles.staff}> nouvelle demande de **__${member.user.username}__**`
        });

        await staffThread.send({ embeds: [staffCall] });
        await staffThread.members.add(member.id);
        await interaction.reply({
          content: `Ta demande de contact à été créée. Tu as maintenant accès au fil ${staffThread}`, ephemeral: true });
      }
      catch(error) {
        logs("error", "staff:button:thread", error, guild.id);
        await interaction.reply({ content: `Une erreur s'est produite.`, ephemeral: true });
      }
    }
          
  });
}

module.exports = { buttonStaffRequest }