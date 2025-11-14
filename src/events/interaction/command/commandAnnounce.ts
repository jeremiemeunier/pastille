import { getParams } from "@functions/Base.function";
import Logs from "@libs/Logs";
import { ChatInputCommandInteraction, Client, EmbedBuilder } from "discord.js";

const commandAnnounceInit = async ({
  client,
  interaction,
}: {
  client: Client;
  interaction: ChatInputCommandInteraction;
}) => {
  const { commandName } = interaction;
  if (commandName !== "announce") return;

  const guildParams = await getParams({ guild: interaction.guild! });
  if (!guildParams) return;

  const { options } = guildParams;

  try {
    const embed = new EmbedBuilder({
      color:
        options.color !== ""
          ? parseInt(options.color, 16)
          : parseInt("E84A95", 16),
      title: interaction.options.getString("title")!,
      description: interaction.options.getString("content")!,
    });
    const message = await interaction.reply({
      embeds: [embed],
      withResponse: true,
      content: "📢 **Annonce** ||@everyone||",
    });
  } catch (err: any) {
    Logs({ node: ["command", "announce"], state: "error", content: err });
  }
};

export { commandAnnounceInit };
