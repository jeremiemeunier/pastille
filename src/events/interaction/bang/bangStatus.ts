import Logs from "@libs/Logs";

const bangStatus = async (
  message: {
    content: any;
    guildId?: any;
    channelId?: any;
    author: any;
    attachments?: { size: any };
    startThread?: (arg0: {
      name: string;
      autoArchiveDuration: number;
      reason: string;
    }) => any;
  },
  guild: { members: { cache: any[] }; channels: { cache: any[] }; id: any }
) => {
  const user = guild.members.cache.find(
    (user: { id: any }) => user?.id === message.author?.id
  );
  const voiceChannelUser = guild.channels.cache.find(
    (channel: { id: any }) => channel?.id === user.voice.channelId
  );
  const statusText = message.content.substring(8);

  try {
    await voiceChannelUser.setTopic(statusText);
  } catch (err: any) {
    Logs({
      node: ["voice", "text", "command", "status"],
      state: "error",
      content: err,
      details: guild?.id,
    });
  }
};

export { bangStatus };
