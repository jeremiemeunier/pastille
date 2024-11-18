import logs from "@functions/logs";

const commandClearInit = async (client: any, interaction: any) => {
  const { commandName } = interaction;
  if (commandName !== "clear") {
    return;
  }

  if (interaction.options.getSubcommand() === "thread") {
    try {
      const interactChannel = client.channels.cache.find(
        (channel: any) => channel.id === interaction.channelId
      );
      const threadsMap = interactChannel.threads.cache;

      await threadsMap.map(async (thread: any) => {
        try {
          await thread.delete();
        } catch (error: any) {
          logs("error", "command:clear:threads", error);
        }
      });

      interaction.reply({
        content: `Tout les threads ont été supprimés`,
        ephemeral: true,
      });
    } catch (error: any) {
      interaction.reply({
        content: "Une erreur est survenue, veuillez réessayer plus tard",
        ephemeral: true,
      });
      logs("error", "command:clear:threads", error);
    }
  }

  if (interaction.options.getSubcommand() === "messages") {
    const interactChannel = client.channels.cache.find(
      (channel: any) => channel.id === interaction.channelId
    );

    await interactChannel.messages.fetch().then((messages: any) => {
      messages.map(async (message: any) => {
        try {
          await message.delete();
        } catch (error: any) {
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

export { commandClearInit };
