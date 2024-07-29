import { getCommands } from "@functions/base";
import logs from "@functions/logs";

const bangExecute = async (
  message: {
    content?: any;
    guildId?: any;
    channelId?: any;
    author?: { bot: boolean; globalName: any };
    attachments?: { size: any };
    startThread?: (arg0: {
      name: string;
      autoArchiveDuration: number;
      reason: string;
    }) => any;
    reply?: any;
  },
  guild: { id: any },
  command: any
) => {
  const commandDetails = await getCommands(guild, command);
  const { response } = commandDetails;

  try {
    await message.reply({ content: response });
  } catch (error: any) {
    logs("error", "bang:personal_command:send", error, guild.id);
  }
};

export { bangExecute };
