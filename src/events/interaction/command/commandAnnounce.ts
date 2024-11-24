import { getParams } from "@functions/base";
import Logs from "@libs/Logs";
import { EmbedBuilder } from "discord.js";

const commandAnnounceInit = async (client: any, interaction: any) => {
  const { commandName } = interaction;
  if (commandName !== "announce") {
    return;
  }

  const guildParams = await getParams(interaction.guild);
  const { options } = guildParams;

  try {
    const embed = new EmbedBuilder({
      color: parseInt(options.color, 16),
      title: interaction.options.getString("title"),
      description: interaction.options.getString("content"),
    });
    const message = await interaction.reply({
      embeds: [embed],
      fetchReply: true,
      content: "📢 **Annonce** ||@everyone||",
    });
  } catch (error: any) {
    Logs("command:announce", "error", error);
  }
};

export { commandAnnounceInit };
