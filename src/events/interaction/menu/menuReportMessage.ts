import { getParams } from "@functions/base";
import Logs from "@libs/Logs";
import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";

const contextReportMessage = async (client: any, interaction: any) => {
  const { commandName } = interaction;
  if (commandName !== "Signaler") {
    return;
  }

  const guild = client.guilds.cache.find(
    (guild: any) => guild?.id === interaction.guildId
  );
  const guildParams = await getParams({ guild: guild });
  const { moderation } = guildParams;

  const reporterUser = guild.members.cache.find(
    (user: any) => user.id === interaction.user.id
  );
  const reportedChannel = guild.channels.cache.find(
    (channel: any) => channel.id === interaction.channelId
  );
  const reportedMessage = reportedChannel.messages.cache.find(
    (message: any) => message.id === interaction.targetId
  );
  const reportChannel = guild.channels.cache.find(
    (channel: any) => channel.id === moderation.channels.report
  );

  try {
    const reportEmbed = new EmbedBuilder({
      color: parseInt("FF0000", 16),
      description: `**Message** :\r\n\`\`\`${reportedMessage.content}\`\`\``,
      fields: [
        {
          name: "Auteur",
          value: `<@${reportedMessage.author.id}>`,
          inline: true,
        },
        {
          name: "Signalement par",
          value: `<@${reporterUser.id}>`,
          inline: true,
        },
        { name: "Message id", value: reportedMessage.id, inline: true },
        { name: "Channel id", value: reportedMessage.channelId, inline: true },
      ],
    });
    const buttonDelete = new ActionRowBuilder().addComponents(
      new ButtonBuilder({
        label: "Supprimer le message et ajouter un warn",
        style: ButtonStyle.Danger,
        custom_id: "deleteReportedMessage",
      })
    );

    await reportChannel.send({
      content: `<@&${moderation.roles.staff}> nouveau signalement d'un message :`,
      embeds: [reportEmbed],
      components: [buttonDelete],
    });
    await interaction.reply({
      content: "Le signalement à bien été transmis à l'équipe de modération",
      ephemeral: true,
    });
  } catch (err: any) {
    Logs("command:report:message", "error", err, guild?.id);
  }
};

export { contextReportMessage };
