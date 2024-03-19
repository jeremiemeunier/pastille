const { Events, EmbedBuilder } = require("discord.js");
const { logs } = require("../../../function/logs");
const { getParams } = require("../../../function/base");

const commandAnnounceInit = async (client, interaction) => {
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
  } catch (error) {
    logs("error", "command:announce", error);
  }
};

module.exports = { commandAnnounceInit };
