import { logs } from "../../../function/logs";
import { getParams, postWarnUser } from "../../../function/base";
import { EmbedBuilder, time } from "@discordjs/builders";

const buttonDeleteMessage = async (client, interaction) => {
  try {
    const { customId } = interaction;
    if (customId !== "deleteReportedMessage") {
      return;
    }

    const guildParams = await getParams(interaction.guild);
    const { moderation, options } = guildParams;

    const guild = interaction.guild;
    const reportChannel = guild.channels.cache.find(
      (channel) => channel.id === moderation.channels.report
    );
    const reportMessage = reportChannel.messages.cache.find(
      (message) => message.id === interaction.message.id
    );
    const reportData = reportMessage.embeds[0].data.fields;

    const embedActionDelete = new EmbedBuilder({
      color: parseInt(options.color, 16),
      description: `${time(new Date())} — <@${interaction.user.id}> — Suppression du message`,
    });
    const embedActionWarn = new EmbedBuilder({
      color: parseInt(options.color, 16),
      description: `${time(new Date())} — <@${interaction.user.id}> — Ajout d'un warn à l'auteur`,
    });
    reportMessage.embeds.push(embedActionDelete);
    reportMessage.embeds.push(embedActionWarn);

    const action = await deleteReportedMessage(reportData, guild);
    if (action.error) {
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
  } catch (error) {
    logs("error", "button:delete_reported:base", error, interaction.guild.id);
  }
};

const deleteReportedMessage = async (data, guild) => {
  try {
    const reportedChannel = guild.channels.cache.find(
      (channel) => channel.id === data[3].value
    );
    if (!reportedChannel) {
      return { error: true, message: "Channel has already deleted" };
    }

    const reportedMessage = await reportedChannel.messages.fetch(data[2].value);
    if (!reportedMessage) {
      return { error: true, message: "Message has already deleted" };
    }

    await postWarnUser(guild, {
      reason: "reportedMessage",
      user_id: reportedMessage.author.id,
    });
    await reportedMessage.delete();
    return { error: false };
  } catch (error) {
    logs("error", "button:delete:reported_message", error, guild.id);
    return { error: true, message: "Somethings went wrong" };
  }
};

export default { buttonDeleteMessage };
