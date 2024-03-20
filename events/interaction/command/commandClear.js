import { Events } from "discord.js";
import { logs } from "../../../function/logs";

const commandClearInit = async (client, interaction) => {
  const { commandName } = interaction;
  if (commandName !== "clear") {
    return;
  }

  if (interaction.options.getSubcommand() === "thread") {
    try {
      const interactChannel = client.channels.cache.find(
        (channel) => channel.id === interaction.channelId
      );
      const threadsMap = interactChannel.threads.cache;

      await threadsMap.map(async (thread) => {
        try {
          await thread.delete();
        } catch (error) {
          logs("error", "command:clear:threads", error);
        }
      });

      interaction.reply({
        content: `Tout les threads ont été supprimés`,
        ephemeral: true,
      });
    } catch (error) {
      interaction.reply({
        content: "Une erreur est survenue, veuillez réessayer plus tard",
        ephemeral: true,
      });
      logs("error", "command:clear:threads", error);
    }
  }

  if (interaction.options.getSubcommand() === "messages") {
    const interactChannel = client.channels.cache.find(
      (channel) => channel.id === interaction.channelId
    );

    await interactChannel.messages.fetch().then((messages) => {
      messages.map(async (message) => {
        try {
          await message.delete();
        } catch (error) {
          logs("error", "command:clear:messages", error);
        }
      });
    });

    interaction.reply({
      content: `Tout les messages ont été supprimés`,
      ephemeral: true,
    });
  }
};

export default { commandClearInit };
