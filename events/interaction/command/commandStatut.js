const { Events, ActivityType } = require("discord.js");
const { logs } = require("../../../function/logs");

const commandStatutInit = async (client, interaction) => {
  const { commandName } = interaction;
  if (commandName !== "status") {
    return;
  }

  try {
    client.user.setPresence({
      activities: [
        {
          name: interaction.options.getString("content"),
          type: ActivityType.Custom,
        },
      ],
    });
    await interaction.reply({
      content: `Le nouveau nouveau statut de ${client.user} a été définis`,
      ephemeral: true,
    });
  } catch (error) {
    logs("error", "command:status", error);
  }
};

module.exports = { commandStatutInit };
