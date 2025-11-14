import { getParams } from "@functions/Base.function";
import Logs from "@libs/Logs";
import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
  ContextMenuCommandInteraction,
  Client,
  TextChannel,
} from "discord.js";

const contextReportMessage = async ({
  client,
  interaction,
}: {
  client: Client;
  interaction: ContextMenuCommandInteraction;
}) => {
  const { commandName } = interaction;
  if (commandName !== "Signaler") {
    return;
  }

  const guild = client.guilds.cache.find(
    (guild: any) => guild?.id === interaction?.guildId
  );

  if (!guild) return;

  const guildParams = await getParams({ guild: guild });
  if (!guildParams) return;

  const { moderation } = guildParams;

  const reporterUser = guild.members.cache.find(
    (user: any) => user?.id === interaction.user?.id
  );

  const reportedChannel = guild.channels.cache.find(
    (channel: any) => channel?.id === interaction.channelId
  ) as TextChannel;
  if (!reportedChannel) return;

  const reportedMessage = reportedChannel.messages.cache.find(
    (message: any) => message?.id === interaction.targetId
  );
  if (!reportedMessage) return;

  const reportChannel = guild.channels.cache.find(
    (channel: any) => channel?.id === moderation.channels.report
  ) as TextChannel;
  if (!reportChannel) return;

  try {
    const reportEmbed = new EmbedBuilder({
      color: parseInt("FF0000", 16),
      description: `**Message** :\r\n\`\`\`${reportedMessage.content}\`\`\``,
      fields: [
        {
          name: "Auteur",
          value: `<@${reportedMessage.author?.id}>`,
          inline: true,
        },
        {
          name: "Signalement par",
          value: `<@${reporterUser?.id}>`,
          inline: true,
        },
        { name: "Message id", value: reportedMessage?.id, inline: true },
        { name: "Channel id", value: reportedMessage.channelId, inline: true },
      ],
    });
    const buttonDelete = new ActionRowBuilder<ButtonBuilder>().addComponents(
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
      flags: MessageFlags.Ephemeral,
    });
  } catch (err: any) {
    Logs({
      node: ["command", "report", "message"],
      state: "error",
      content: err,
      details: guild?.id,
    });
  }
};

export { contextReportMessage };
