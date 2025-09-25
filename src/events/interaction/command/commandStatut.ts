import Logs from "@libs/Logs";
import { ActivityType, MessageFlags } from "discord.js";

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
      flags: MessageFlags.Ephemeral,
    });
  } catch (err: any) {
    Logs("command:status", "error", err);
  }
};

export { commandStatutInit };
