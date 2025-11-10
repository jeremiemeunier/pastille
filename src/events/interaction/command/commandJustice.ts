import { getParams } from "@functions/Base.function";
import Logs from "@libs/Logs";
import { Client, EmbedBuilder } from "discord.js";

const commandJusticeInit = async (client: Client, interaction: any) => {
  const { commandName } = interaction;
  if (commandName !== "justice") {
    return;
  }

  try {
    const embed = new EmbedBuilder({
      color: 1752220,
      title: "test",
      description: "test",
    });
    const message = await interaction.reply({
      embeds: [embed],
      content: `Voici un résumé de tes sanctions et avertissement gérer par ${client.user?.displayName}`,
    });
  } catch (err: any) {
    Logs(["command", "justice"], "error", err);
  }
};

export { commandJusticeInit };
