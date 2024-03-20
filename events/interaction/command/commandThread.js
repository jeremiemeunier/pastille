import { ChannelType, Events, EmbedBuilder } from "discord.js";
import { logs } from "../../../function/logs";
import { getParams } from "../../../function/base";

const commandThreadInit = async (client, interaction) => {
  const { commandName } = interaction;
  if (commandName !== "fils") {
    return;
  }

  const guildParams = await getParams(interaction.guild);
  const { options } = guildParams;

  const channel = client.channels.cache.find(
    (channel) => channel.id === interaction.channelId
  );

  try {
    const thread = await channel.threads.create({
      name: interaction.options.getString("title"),
      autoArchiveDuration: 60,
      reason: interaction.options.getString("title"),
      type: ChannelType.PrivateThread,
    });
    await thread.members.add(interaction.user.id);
    await interaction.reply({
      content: `Tu as maintenant accès au thread ${thread}`,
      ephemeral: true,
    });

    let embed = new EmbedBuilder({
      color: parseInt(options.color, 16),
      description: "Bienvenue sur ton thread dédié",
    });
    const msg = await thread.send({ embeds: [embed] });
  } catch (error) {
    logs("error", "command:thread", error);
  }
};

export { commandThreadInit };
