import Logs from "@libs/Logs";
import { ActivityType } from "discord.js";

const commandStatutInit = async (client: any, interaction: any) => {
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
  } catch (error: any) {
    Logs("command:status", "error", error);
  }
};

export { commandStatutInit };
