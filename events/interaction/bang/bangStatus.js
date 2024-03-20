import { logs } from "../../../function/logs";

const bangStatus = async (message, guild) => {
  const user = guild.members.cache.find(
    (user) => user.id === message.author.id
  );
  const voiceChannelUser = guild.channels.cache.find(
    (channel) => channel.id === user.voice.channelId
  );
  const statusText = message.content.substring(8);

  try {
    await voiceChannelUser.setTopic(statusText);
  } catch (error) {
    logs("error", "voice:text:command:status", error, guild.id);
  }
};

export { bangStatus };
