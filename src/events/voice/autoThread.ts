import { getParams } from "@functions/base";
import {
  createVoiceThread,
  deleteVoiceThread,
  haveVoiceThread,
  joinAllVoiceThread,
  joinVoiceThread,
  leaveVoiceThread,
} from "@functions/voice";
import Logs from "@libs/Logs";
import { Guild, VoiceChannel } from "discord.js";

export const countMembers = async ({
  channel,
  guild,
}: {
  channel: VoiceChannel;
  guild: Guild;
}) => {
  try {
    const connected = channel.members.map((x: any) => x).length;
    return connected;
  } catch (err: any) {
    Logs("voice:count_members", "error", err, guild?.id);
  }
};

export const getTextualChannel = async (
  channel: { parentId: null },
  guild: { channels: { cache: any[] }; id: any }
) => {
  const guildParams = await getParams({ guild: guild.id });
  if (!guildParams) return;

  const { channels } = guildParams.options;

  try {
    if (channel.parentId !== null) {
      const textual = guild.channels.cache.find(
        (textual: { name: any; parentId: any }) =>
          textual.name === channels.voiceText &&
          textual.parentId === channel.parentId
      );

      if (textual === undefined) {
        const textualGlobal = guild.channels.cache.find(
          (textual: { name: any; parentId: null }) =>
            textual.name === channels.voiceText && textual.parentId === null
        );

        return textualGlobal;
      }

      return textual;
    } else {
      const textual = guild.channels.cache.find(
        (textual: { name: any; parentId: null }) =>
          textual.name === channels.voiceText && textual.parentId === null
      );

      return textual;
    }
  } catch (err: any) {
    Logs("voice:search_textual", "error", err, guild?.id);
  }
};

export const autoThread = async ({
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
  if (newState.channelId === oldState.channelId) return;

  const guild =
    client.guilds.cache.find(
      (guild: { id: any }) => guild?.id === oldState.guild?.id
    ) ||
    client.guilds.cache.find(
      (guild: { id: any }) => guild?.id === newState.guild?.id
    );
  const user = oldState.member.user?.id || newState.member.user?.id;

  try {
    if (newState.channelId === null) {
      // user disconnected from channel
      // find channel
      const voiceChannel = guild.channels.cache.find(
        (voiceChannel: { id: any }) => voiceChannel?.id === oldState.channelId
      );
      // count members and find textual parent linked
      const connected = await countMembers({
        channel: voiceChannel,
        guild: guild,
      });
      const textual = await getTextualChannel(voiceChannel, guild);

      if (connected === 0) {
        deleteVoiceThread(guild, voiceChannel, textual);
      } else {
        leaveVoiceThread(guild, voiceChannel, textual, user);
      }
    } else if (oldState.channelId === null) {
      // user connect for first time
      const voiceChannel = guild.channels.cache.find(
        (voiceChannel: { id: any }) => voiceChannel?.id === newState.channelId
      );
      const connected = await countMembers({
        channel: voiceChannel,
        guild: guild,
      });
      const textual = await getTextualChannel(voiceChannel, guild);
      const threadAlreadyExist = await haveVoiceThread({
        channel: voiceChannel,
        threadChannel: textual,
      });

      if (connected === 1 || !threadAlreadyExist) {
        await createVoiceThread(guild, voiceChannel, textual, user);

        if (!threadAlreadyExist) {
          await joinAllVoiceThread({
            channel: voiceChannel,
            threadChannel: textual,
            user: user,
          });
        }
      } else {
        joinVoiceThread({
          guild: guild,
          channel: voiceChannel,
          threadChannel: textual,
          user: user,
        });
      }
    } else {
      // user switch two voice channel
      const oldVoiceChannel = guild.channels.cache.find(
        (oldVoiceChannel: { id: any }) =>
          oldVoiceChannel?.id === oldState.channelId
      );
      const newVoiceChannel = guild.channels.cache.find(
        (newVoiceChannel: { id: any }) =>
          newVoiceChannel?.id === newState.channelId
      );
      const oldConnected = await countMembers({
        channel: oldVoiceChannel,
        guild: guild,
      });
      const newConnected = await countMembers({
        channel: newVoiceChannel,
        guild: guild,
      });
      const oldTextual = await getTextualChannel(oldVoiceChannel, guild);
      const newTextual = await getTextualChannel(newVoiceChannel, guild);
      const threadAlreadyExist = await haveVoiceThread({
        channel: newVoiceChannel,
        threadChannel: newTextual,
      });

      if (oldConnected === 0) {
        deleteVoiceThread(guild, oldVoiceChannel, oldTextual);
      } else {
        leaveVoiceThread(guild, oldVoiceChannel, oldTextual, user);
      }
      if (newConnected === 1 || !threadAlreadyExist) {
        await createVoiceThread(guild, newVoiceChannel, newTextual, user);

        if (!threadAlreadyExist) {
          await joinAllVoiceThread({
            channel: newVoiceChannel,
            threadChannel: newTextual,
            user: user,
          });
        }
      } else {
        joinVoiceThread({
          guild: guild,
          channel: newVoiceChannel,
          threadChannel: newTextual,
          user: user,
        });
      }
    }
  } catch (err: any) {
    Logs("voice", "error", err);
    return;
  }
};
