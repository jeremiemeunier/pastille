import { time } from "@discordjs/builders";
import { getParams, postWarnUser } from "@functions/Base.function";
import Logs from "@libs/Logs";
import {
  Events,
  EmbedBuilder,
  MessageFlags,
  ButtonInteraction,
  Client,
  Guild,
  TextChannel,
  APIEmbedField,
} from "discord.js";

const buttonDeleteMessage = async ({
  client,
  interaction,
}: {
  client: Client;
  interaction: ButtonInteraction;
}) => {
  try {
    const { customId } = interaction;
    if (customId !== "deleteReportedMessage") return;

    if (!interaction.guild) return;

    const guildParams = await getParams({ guild: interaction.guild });
    if (!guildParams) return;

    const { moderation, options } = guildParams;

    const guild = interaction?.guild;
    if (!guild) return;

    const reportChannel = guild.channels.cache.find(
      (channel: { id: any }) => channel?.id === moderation.channels.report
    ) as TextChannel;

    if (!reportChannel) return;

    const reportMessage = reportChannel.messages.cache.find(
      (message: { id: any }) => message?.id === interaction.message?.id
    );

    if (!reportMessage) return;

    const reportData = reportMessage.embeds[0].data.fields;

    if (!reportData) return;

    const embedActionDelete = new EmbedBuilder({
      color:
        options.color !== ""
          ? parseInt(options.color, 16)
          : parseInt("E84A95", 16),
      description: `${time(new Date())} — <@${
        interaction.user?.id
      }> — Suppression du message`,
    });
    const embedActionWarn = new EmbedBuilder({
      color:
        options.color !== ""
          ? parseInt(options.color, 16)
          : parseInt("E84A95", 16),
      description: `${time(new Date())} — <@${
        interaction.user?.id
      }> — Ajout d'un warn à l'auteur`,
    });
    reportMessage.embeds.push(embedActionDelete as any);
    reportMessage.embeds.push(embedActionWarn as any);

    const action = await deleteReportedMessage(reportData, guild);
    if (action.err) {
      await interaction.reply({
        content: action.message,
        flags: MessageFlags.Ephemeral,
      });
    } else {
      await interaction.reply({
        content: "Le message à été supprimé",
        flags: MessageFlags.Ephemeral,
      });
      await reportMessage.edit({
        content: reportMessage.content,
        embeds: reportMessage.embeds,
        components: [],
      });
    }
  } catch (err: any) {
    Logs({
      node: ["button", "delete_reported", "base"],
      state: "error",
      content: err,
      details: interaction?.guild?.id,
    });
  }
};

const deleteReportedMessage = async (data: APIEmbedField[], guild: Guild) => {
  try {
    const reportedChannel = guild.channels.cache.find(
      (channel: { id: any }) => channel?.id === data[3].value
    ) as TextChannel;

    if (!reportedChannel) {
      return { err: true, message: "Channel has already deleted" };
    }

    const reportedMessage = await reportedChannel.messages.fetch(data[2].value);
    if (!reportedMessage) {
      return { err: true, message: "Message has already deleted" };
    }

    await postWarnUser({
      guild: guild,
      data: {
        reason: "reportedMessage",
        user_id: reportedMessage.author?.id,
      },
    });
    await reportedMessage.delete();
    return { err: false };
  } catch (err: any) {
    Logs({
      node: ["button", "delete", "reported_message"],
      state: "error",
      content: err,
      details: guild?.id,
    });
    return { err: true, message: "Somethings went wrong" };
  }
};

export { buttonDeleteMessage };
