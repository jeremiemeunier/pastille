import { Events } from "discord.js";
import { autoThread } from "./voice/autoThread";
import { getParams } from "@functions/base";
import { autoChannel, autoRemoveChannel } from "./voice/autoChannel";

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
          (guild: { id: any }) => guild?.id === oldState.guild?.id
        ) ||
        client.guilds.cache.find(
          (guild: { id: any }) => guild?.id === newState.guild?.id
        );
      const guildParams = await getParams({ guild: guild });
      const { channels } = guildParams.options;

      if (
        channels?.voices &&
        channels.voices.length > 0 &&
        channels.voices.indexOf(newState.channelId) >= 0
      ) {
        // test if channel is configured to make new channel
        autoChannel({ oldState: oldState, newState: newState, client: client });
        return;
      }

      autoThread({ oldState: oldState, newState: newState, client: client });
      autoRemoveChannel({
        oldState: oldState,
        newState: newState,
        client: client,
      });
    }
  );
};
