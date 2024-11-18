import { TwitchTypes } from "@/types/Twitch.types";
import { getStreamers } from "@functions/base";
import logs from "@functions/logs";
import TwitchAxios from "@utils/TwitchAxios";
import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
const waitingTime = 300000;

const addonsLoaded = async (guild: any, params: any) => {
  logs("start", "addons:twitch:start", "Starting twitch addons", guild.id);

  // get stream list
  // group streamer id

  const authToken = await requestAuthenticator();
  const streamerList = await getStreamers({ guild: guild });

  const notificationChannel = guild.channels.cache.find(
    (channel: any) => channel.id === params.channel
  );
  const notificationRole = guild.roles.cache.find(
    (role: any) => role.id === params.role
  );

  const pingStreamer = setInterval(async () => {
    const authToken = await requestAuthenticator();

    if (authToken) {
      streamerList.map(async (item: TwitchTypes) => {
        const { twitch } = item;
        const streamerState = await requestStreamerState(twitch.id, authToken);

        if (streamerState !== undefined) {
          if (startAnalyze(streamerState.started_at)) {
            try {
              const liveButton = new ActionRowBuilder().addComponents(
                new ButtonBuilder({
                  label: "Rejoindre sur twitch.tv",
                  style: ButtonStyle.Link,
                  url: `https://twitch.tv/${twitch.name.toString()}`,
                })
              );
              const liveEmbed = new EmbedBuilder({
                color: parseInt("6441a5", 16),
                title: `${twitch.name.toString()} est actuellement en live !`,
                description: `Il stream : **__${streamerState.title}__** sur **__${streamerState.game_name}__**`,
              });

              try {
                await notificationChannel.send({
                  content: `${twitch.name.toString()} est en live ! ${
                    item.message ? item.message : ""
                  } ${notificationRole}`,
                  embeds: [liveEmbed],
                  components: [liveButton],
                });
              } catch (error: any) {
                logs("error", "addons:twitch:send", error, guild.id);
              }
            } catch (error: any) {
              logs("error", "addons:twitch:ping", error, guild.id);
            }
          }
        }
      });
    } else {
      logs("error", "twitch:auth:global", "Cannot auth to twitch");
    }
  }, waitingTime);
};

/**
 * Return true or false to indicate if livestream was started within range
 *
 * @param {*} startItem
 * @returns {boolean} Return true if live was started within range of settings
 */
const startAnalyze = (startItem: any) => {
  const now = Date.parse(new Date().toString());
  const start = Date.parse(startItem);
  const prev = now - waitingTime;
  const next = now + waitingTime;

  if (start > prev && start < next) {
    return true;
  } else {
    return false;
  }
};

/**
 * Make auth and return twitch access_token granted
 *
 * @returns Access token
 */
const requestAuthenticator = async () => {
  try {
    const requestToken = await TwitchAxios.post(
      "https://id.twitch.tv/oauth2/token",
      {
        client_id: process.env.TWITCH_CLIENT_TOKEN,
        client_secret: process.env.TWITCH_SECRET_TOKEN,
        grant_type: "client_credentials",
      }
    );

    return requestToken.data.access_token;
  } catch (error: any) {
    logs("error", "twitch:auth", error.message || error);
  }
};

/**
 * Return streamer data
 *
 * @param {*} streamerId
 * @param {*} bearerToken
 * @returns A json object with streamer data
 */
const requestStreamerState = async (
  streamerId: string,
  bearerToken: string
) => {
  try {
    const requestState = await TwitchAxios.get(
      "https://api.twitch.tv/helix/streams",
      {
        params: { user_id: streamerId },
        headers: {
          "Client-Id": process.env.TWITCH_CLIENT_TOKEN,
          Authorization: `Bearer ${bearerToken}`,
        },
      }
    );
    return requestState.data.data[0];
  } catch (error: any) {
    logs("error", "twitch:request:state", error.message || error);
  }
};

export { addonsLoaded };
