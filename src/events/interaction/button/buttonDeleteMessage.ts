import { time } from "@discordjs/builders";
import { getParams, postWarnUser } from "@functions/base";
import Logs from "@libs/Logs";
import { Events, EmbedBuilder } from "discord.js";

const buttonDeleteMessage = async (
  _client: {
    on: (arg0: Events, arg1: (interaction: any) => Promise<void>) => void;
  },
  interaction: {
    isButton?: () => any;
    isChatInputCommand?: () => any;
    isUserContextMenuCommand?: () => any;
    isMessageContextMenuCommand?: () => any;
    isModalSubmit?: () => any;
    guild?: any;
    message?: any;
    user?: any;
    reply?: any;
    customId?: any;
  }
) => {
  try {
    const { customId } = interaction;
    if (customId !== "deleteReportedMessage") {
      return;
    }

    const guildParams = await getParams(interaction.guild);
    const { moderation, options } = guildParams;

    const guild = interaction.guild;
    const reportChannel = guild.channels.cache.find(
      (channel: { id: any }) => channel.id === moderation.channels.report
    );
    const reportMessage = reportChannel.messages.cache.find(
      (message: { id: any }) => message.id === interaction.message.id
    );
    const reportData = reportMessage.embeds[0].data.fields;

    const embedActionDelete = new EmbedBuilder({
      color: parseInt(options.color, 16),
      description: `${time(new Date())} — <@${
        interaction.user.id
      }> — Suppression du message`,
    });
    const embedActionWarn = new EmbedBuilder({
      color: parseInt(options.color, 16),
      description: `${time(new Date())} — <@${
        interaction.user.id
      }> — Ajout d'un warn à l'auteur`,
    });
    reportMessage.embeds.push(embedActionDelete);
    reportMessage.embeds.push(embedActionWarn);

    const action = await deleteReportedMessage(reportData, guild);
    if (action.err) {
      await interaction.reply({ content: action.message, ephemeral: true });
    } else {
      await interaction.reply({
        content: "Le message à été supprimé",
        ephemeral: true,
      });
      await reportMessage.edit({
        content: reportMessage.content,
        embeds: reportMessage.embeds,
        components: [],
      });
    }
  } catch (err: any) {
    Logs("button:delete_reported:base", "error", err, interaction.guild?.id);
  }
};

const deleteReportedMessage = async (
  data: { value: any }[],
  guild: { channels: { cache: any[] }; id: any }
) => {
  try {
    const reportedChannel = guild.channels.cache.find(
      (channel: { id: any }) => channel.id === data[3].value
    );
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
        user_id: reportedMessage.author.id,
      },
    });
    await reportedMessage.delete();
    return { err: false };
  } catch (err: any) {
    Logs("button:delete:reported_message", "error", err, guild?.id);
    return { err: true, message: "Somethings went wrong" };
  }
};

export { buttonDeleteMessage };
