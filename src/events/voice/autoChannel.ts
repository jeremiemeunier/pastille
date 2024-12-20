import { CategoryChannel, ChannelType, User, VoiceChannel } from "discord.js";
import { countMembers } from "./autoThread";
import Logs from "@libs/Logs";

const getGuild = ({
  client,
  oldState,
  newState,
}: {
  oldState: {
    channelId: null;
    guild: { id: any };
    member: { user: { id: any } };
  };
  newState: {
    channelId: null;
    guild: { id: any };
    member: { user: { id: any } };
  };
  client: any;
}) => {
  return (
    client.guilds.cache.find(
      (guild: { id: any }) => guild.id === oldState.guild.id
    ) ||
    client.guilds.cache.find(
      (guild: { id: any }) => guild.id === newState.guild.id
    )
  );
};

const getUser = ({ guild, user }: { guild: any; user: String }) => {
  return guild.members.cache.find((member: User) => member.id === user);
};

export const autoChannel = async ({
  oldState,
  newState,
  client,
}: {
  oldState: {
    channelId: null;
    guild: { id: any };
    member: { user: { id: any } };
  };
  newState: {
    channelId: null;
    guild: { id: any };
    member: { user: { id: any } };
  };
  client: any;
}) => {
  const guild = getGuild({
    client: client,
    oldState: oldState,
    newState: newState,
  });
  const guildUser = getUser({ guild: guild, user: newState.member.user.id });
  const channel = guild.channels.cache.find(
    (voice: VoiceChannel) => voice.id === newState.channelId
  );
  const parent = guild.channels.cache.find(
    (p: CategoryChannel) => p.id === channel.parentId
  );

  // making channel
  try {
    const newChannel = (await guild.channels.create({
      name: `Voice of ${guildUser.user.globalName}`,
      type: ChannelType.GuildVoice,
      parent: parent,
      userLimit: 8,
    })) as VoiceChannel;

    await guildUser.voice.setChannel(newChannel);
  } catch (error: any) {
    Logs("voice:create:dedicated", "error", error, guild.id);
  }
};

export const autoRemoveChannel = async ({
  oldState,
  newState,
  client,
}: {
  oldState: {
    channelId: null;
    guild: { id: any };
    member: { user: { id: any } };
  };
  newState: {
    channelId: null;
    guild: { id: any };
    member: { user: { id: any } };
  };
  client: any;
}) => {
  const guild = getGuild({
    client: client,
    oldState: oldState,
    newState: newState,
  });
  const guildUser = getUser({ guild: guild, user: oldState.member.user.id });
  const channel = guild.channels.cache.find(
    (voice: VoiceChannel) => voice.id === oldState.channelId
  );

  if (channel && channel.name.startsWith("Voice of ")) {
    const presence = await countMembers({ channel: channel, guild: guild });
    if (presence === 0 && channel.name.startsWith("Voice of ")) {
      try {
        await channel.delete();
      } catch (error: any) {
        Logs("auto:voice:delete", "error", error, guild);
      }
    }
  }
};
