import { getParams } from "@functions/Base.function";
import Logs from "@libs/Logs";
import {
  Client,
  EmbedBuilder,
  Events,
  MessageFlags,
  ModalSubmitInteraction,
  TextChannel,
} from "discord.js";

const modalReportUser = async ({
  client,
  interaction,
}: {
  client: Client;
  interaction: ModalSubmitInteraction;
}) => {
  if (interaction.customId !== "modalReportUser") return;

  const guild = client.guilds.cache.find(
    (guild: { id: any }) => guild?.id === interaction?.guildId
  );
  if (!guild) return;

  const guildParams = await getParams({ guild: guild });
  if (!guildParams) return;

  const { moderation } = guildParams;

  const reportChannel = guild.channels.cache.find(
    (channel: { id: any }) => channel?.id === moderation.channels.report
  ) as TextChannel;
  if (!reportChannel) return;

  const reporterUser = guild.members.cache.find(
    (user: { id: any }) => user?.id === interaction.user?.id
  );
  if (!reporterUser) return;

  const reportedUser = guild.members.cache.find(
    (user: { id: any }) =>
      user?.id === interaction.fields.getTextInputValue("reportedUser")
  );
  if (!reportedUser) return;

  const shortReportReason =
    interaction.fields.getTextInputValue("shortReportReason");
  const largeReportReason =
    interaction.fields.getTextInputValue("largeReportReason");

  try {
    const reportEmbed = new EmbedBuilder({
      color: parseInt("FF0000", 16),
      description: `**Description rapide** :\r\n${shortReportReason}\r\n\r\n**Informations supplémentaires** :\r\n${largeReportReason}`,
      fields: [
        {
          name: "Signalement par",
          value: `<@${reporterUser?.id}>`,
          inline: true,
        },
        {
          name: "Signalement de",
          value: `<@${reportedUser?.id}>`,
          inline: true,
        },
      ],
    });
    await reportChannel.send({
      content: `<@&${moderation.roles.staff}> nouveau signalement d'un utilisateur`,
      embeds: [reportEmbed],
    });
    await interaction.reply({
      content: "Votre signalement à bien été transmis à la modération",
      flags: MessageFlags.Ephemeral,
    });
  } catch (err: any) {
    await interaction.reply({
      content:
        "Une erreur est survenue lors du signalement veuillez réessayer plus tard.",
    });
    Logs(["context", "report", "user"], "error", err, guild?.id);
  }
};

export { modalReportUser };
