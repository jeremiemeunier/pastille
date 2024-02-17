const { Events, EmbedBuilder } = require("discord.js");
const { logs } = require("../../../function/logs");
const { getRoles, getParams } = require("../../../function/base");

const commandRoleInit = async (client, interaction) => {
  const { commandName } = interaction;
  if (commandName !== "role") {
    return;
  }

  const guildParams = await getParams(interaction.guild);
  const { options } = guildParams;
  const roles = await getRoles(interaction.guild);
  let fields = [];

  roles.map((item, index) => {
    fields.push({
      name: `${item.emote} — ${item.name}`,
      value: item.description,
      inline: true,
    });
  });

  const embed = new EmbedBuilder({
    color: parseInt(options.color, 16),
    title: "Pastille autorole",
    description:
      "Clique sur les réactions en dessous de ce message pour t'ajouter les rôles en fonction de tes centres d'intérêt.",
    fields: fields,
  });
  try {
    const message = await interaction.reply({
      embeds: [embed],
      fetchReply: true,
    });

    roles.map(async (item) => {
      try {
        await message.react(item.emote);
      } catch (error) {
        logs("error", "command:role:react", error, interaction.guild.id);
      }
    });
  } catch (error) {
    logs("error", "command:role:send", error, interaction.guild.id);
  }
};

module.exports = { commandRoleInit };
