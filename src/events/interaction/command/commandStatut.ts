import Logs from "@libs/Logs";
import {
  ActivityType,
  ChatInputCommandInteraction,
  Client,
  MessageFlags,
} from "discord.js";

const commandStatutInit = async ({
  client,
  interaction,
}: {
  client: Client;
  interaction: ChatInputCommandInteraction;
}) => {
  const { commandName } = interaction;
  if (commandName !== "status") return;

  try {
    client.user!.setPresence({
      activities: [
        {
          name: interaction.options.getString("content")!,
          type: ActivityType.Custom,
        },
      ],
    });
    await interaction.reply({
      content: `Le nouveau nouveau statut de ${client.user} a été définis`,
      flags: MessageFlags.Ephemeral,
    });
  } catch (err: any) {
    Logs({
      node: ["command", "status"],
      state: "error",
      content: err,
      details: interaction?.guild!.id!,
    });
  }
};

export { commandStatutInit };
