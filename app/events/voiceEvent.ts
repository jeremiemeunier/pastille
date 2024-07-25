import { getParams } from "@functions/base";
import logs from "@functions/logs";
import {
  createVoiceThread,
  deleteVoiceThread,
  joinVoiceThread,
  leaveVoiceThread,
} from "@functions/voice";
import { Events } from "discord.js";

export const countMembers = async (
  channel: {
    members: {
      map: (arg0: (x: any) => any) => { (): any; new (): any; length: any };
    };
  },
  guild: { id: any }
) => {
  try {
    const connected = channel.members.map((x: any) => x).length;
    return connected;
  } catch (error: any) {
    logs("error", "voice:count_members", error, guild.id);
  }
};

export const getTextualChannel = async (
  channel: { parentId: null },
  guild: { channels: { cache: any[] }; id: any }
) => {
  const guildParams = await getParams(guild);
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
  } catch (error: any) {
    logs("error", "voice:search_textual", error, guild.id);
  }
};

export const voiceEventInit = (client: any) => {
  client.on(
    Events.VoiceStateUpdate,
    async (
      oldState: {
        channelId: null;
        guild: { id: any };
        member: { user: { id: any } };
      },
      newState: {
        channelId: null;
        guild: { id: any };
        member: { user: { id: any } };
      }
    ) => {
      if (newState.channelId === oldState.channelId) {
        return;
      }

      const guild =
        client.guilds.cache.find(
          (guild: { id: any }) => guild.id === oldState.guild.id
        ) ||
        client.guilds.cache.find(
          (guild: { id: any }) => guild.id === newState.guild.id
        );
      try {
        const user = oldState.member.user.id || newState.member.user.id;

        if (newState.channelId === null) {
          const voiceChannel = guild.channels.cache.find(
            (voiceChannel: { id: any }) =>
              voiceChannel.id === oldState.channelId
          );
          const connected = await countMembers(voiceChannel, guild);
          const textual = await getTextualChannel(voiceChannel, guild);

          if (connected === 0) {
            deleteVoiceThread(guild, voiceChannel, textual);
          } else {
            leaveVoiceThread(guild, voiceChannel, textual, user);
          }
        } else if (oldState.channelId === null) {
          const voiceChannel = guild.channels.cache.find(
            (voiceChannel: { id: any }) =>
              voiceChannel.id === newState.channelId
          );
          const connected = await countMembers(voiceChannel, guild);
          const textual = await getTextualChannel(voiceChannel, guild);

          if (connected === 1) {
            createVoiceThread(guild, voiceChannel, textual, user);
          } else {
            joinVoiceThread(guild, voiceChannel, textual, user);
          }
        } else {
          const oldVoiceChannel = guild.channels.cache.find(
            (oldVoiceChannel: { id: any }) =>
              oldVoiceChannel.id === oldState.channelId
          );
          const newVoiceChannel = guild.channels.cache.find(
            (newVoiceChannel: { id: any }) =>
              newVoiceChannel.id === newState.channelId
          );
          const oldConnected = await countMembers(oldVoiceChannel, guild);
          const newConnected = await countMembers(newVoiceChannel, guild);
          const oldTextual = await getTextualChannel(oldVoiceChannel, guild);
          const newTextual = await getTextualChannel(newVoiceChannel, guild);

          if (oldConnected === 0) {
            deleteVoiceThread(guild, oldVoiceChannel, oldTextual);
          } else {
            leaveVoiceThread(guild, oldVoiceChannel, oldTextual, user);
          }
          if (newConnected === 1) {
            createVoiceThread(guild, newVoiceChannel, newTextual, user);
          } else {
            joinVoiceThread(guild, newVoiceChannel, newTextual, user);
          }
        }
      } catch (error: any) {
        logs("error", "voice", error);
        return;
      }
    }
  );
};
