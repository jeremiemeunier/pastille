import Logs from "@libs/Logs";
import { MessageFlags } from "discord.js";

const commandClearInit = async (client: any, interaction: any) => {
  const { commandName } = interaction;
  if (commandName !== "clear") {
    return;
  }

  if (interaction.options.getSubcommand() === "thread") {
    try {
      const interactChannel = client.channels.cache.find(
        (channel: any) => channel?.id === interaction.channelId
      );
      const threadsMap = interactChannel.threads.cache;

      await threadsMap.map(async (thread: any) => {
        try {
          await thread.delete();
        } catch (err: any) {
          Logs("command:clear:threads", "error", err);
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
      Logs("command:clear:threads", "error", err);
    }
  }

  if (interaction.options.getSubcommand() === "messages") {
    const interactChannel = client.channels.cache.find(
      (channel: any) => channel?.id === interaction.channelId
    );

    await interactChannel.messages.fetch().then((messages: any) => {
      messages.map(async (message: any) => {
        try {
          await message.delete();
        } catch (err: any) {
          Logs("command:clear:messages", "error", err);
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
