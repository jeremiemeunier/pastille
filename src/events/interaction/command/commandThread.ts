import { getParams } from "@functions/Base.function";
import Logs from "@libs/Logs";
import { ChannelType, EmbedBuilder, MessageFlags } from "discord.js";

const commandThreadInit = async (client: any, interaction: any) => {
  const { commandName } = interaction;
  if (commandName !== "fils") {
    return;
  }

  const guildParams = await getParams({ guild: interaction?.guildId });
  if (!guildParams) return;

  const { options } = guildParams;

  const channel = client.channels.cache.find(
    (channel: any) => channel?.id === interaction.channelId
  );

  try {
    const thread = await channel.threads.create({
      name: interaction.options.getString("title"),
      autoArchiveDuration: 60,
      reason: interaction.options.getString("title"),
      type: ChannelType.PrivateThread,
    });
    await thread.members.add(interaction.user?.id);
    await interaction.reply({
      content: `Tu as maintenant accès au thread ${thread}`,
      flags: MessageFlags.Ephemeral,
    });

    let embed = new EmbedBuilder({
      color:
        options.color !== ""
          ? parseInt(options.color, 16)
          : parseInt("E84A95", 16),
      description: "Bienvenue sur ton thread dédié",
    });
    const msg = await thread.send({ embeds: [embed] });
  } catch (err: any) {
    Logs(["command", "thread"], "error", err);
  }
};

export { commandThreadInit };
