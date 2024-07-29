import logs from "@functions/logs";
import { Events, ActivityType } from "discord.js";

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
    logs("error", "command:status", error);
  }
};

export { commandStatutInit };
