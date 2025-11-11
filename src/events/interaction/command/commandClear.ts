import Logs from "@libs/Logs";
import {
  ChatInputCommandInteraction,
  Client,
  MessageFlags,
  TextChannel,
} from "discord.js";

const commandClearInit = async ({
  client,
  interaction,
}: {
  client: Client;
  interaction: ChatInputCommandInteraction;
}) => {
  const { commandName } = interaction;
  if (commandName !== "clear") {
    return;
  }

  if (interaction.options.getSubcommand() === "thread") {
    try {
      const interactChannel = client.channels.cache.find(
        (channel: any) => channel?.id === interaction.channelId
      ) as TextChannel;

      const threadsMap = interactChannel!.threads.cache;

      threadsMap.map(async (thread: any) => {
        try {
          await thread.delete();
        } catch (err: any) {
          Logs(["command", "clear", "threads"], "error", err);
        }
      });

      interaction.reply({
        content: `Tout les threads ont été supprimés`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (err: any) {
      interaction.reply({
        content: "Une erreur est survenue, veuillez réessayer plus tard",
        flags: MessageFlags.Ephemeral,
      });
      Logs(["command", "clear", "threads"], "error", err);
    }
  }

  if (interaction.options.getSubcommand() === "messages") {
    const interactChannel = client.channels.cache.find(
      (channel: any) => channel?.id === interaction.channelId
    ) as TextChannel;

    await interactChannel!.messages.fetch().then((messages: any) => {
      messages.map(async (message: any) => {
        try {
          await message.delete();
        } catch (err: any) {
          Logs(["command", "clear", "messages"], "error", err);
        }
      });
    });

    interaction.reply({
      content: `Tout les messages ont été supprimés`,
      flags: MessageFlags.Ephemeral,
    });
  }
};

export { commandClearInit };
