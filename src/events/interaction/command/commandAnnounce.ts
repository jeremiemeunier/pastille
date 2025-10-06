import { getParams } from "@functions/base";
import Logs from "@libs/Logs";
import { Client, EmbedBuilder } from "discord.js";

const commandAnnounceInit = async (client: Client, interaction: any) => {
  const { commandName } = interaction;
  if (commandName !== "announce") {
    return;
  }

  const guildParams = await getParams(interaction?.guildId);
  if (!guildParams) return;

  const { options } = guildParams;

  try {
    const embed = new EmbedBuilder({
      color:
        options.color !== ""
          ? parseInt(options.color, 16)
          : parseInt("E84A95", 16),
      title: interaction.options.getString("title"),
      description: interaction.options.getString("content"),
    });
    const message = await interaction.reply({
      embeds: [embed],
      withResponse: true,
      content: "📢 **Annonce** ||@everyone||",
    });
  } catch (err: any) {
    Logs("command:announce", "error", err);
  }
};

export { commandAnnounceInit };
