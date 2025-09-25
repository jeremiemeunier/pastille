import { getParams } from "@functions/base";
import Logs from "@libs/Logs";
import { EmbedBuilder, Events, MessageFlags } from "discord.js";

const modalReportUser = async (
  client: {
    on?: (arg0: Events, arg1: (interaction: any) => Promise<void>) => void;
    guilds?: any;
  },
  interaction: {
    isButton?: () => any;
    isChatInputCommand?: () => any;
    isUserContextMenuCommand?: () => any;
    isMessageContextMenuCommand?: () => any;
    isModalSubmit?: () => any;
    customId?: any;
    guildId?: any;
    user?: any;
    fields?: any;
    reply?: any;
  }
) => {
  if (interaction.customId !== "modalReportUser") {
    return;
  }

  const guild = client.guilds.cache.find(
    (guild: { id: any }) => guild?.id === interaction.guildId
  );
  const guildParams = await getParams({ guild: guild });
  const { moderation } = guildParams;

  const reportChannel = guild.channels.cache.find(
    (channel: { id: any }) => channel.id === moderation.channels.report
  );
  const reporterUser = guild.members.cache.find(
    (user: { id: any }) => user.id === interaction.user.id
  );
  const reportedUser = guild.members.cache.find(
    (user: { id: any }) =>
      user.id === interaction.fields.getTextInputValue("reportedUser")
  );
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
          value: `<@${reporterUser.id}>`,
          inline: true,
        },
        {
          name: "Signalement de",
          value: `<@${reportedUser.id}>`,
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
    Logs("context:report_user", "error", err, guild?.id);
  }
};

export { modalReportUser };
