import { StreamerTypes } from "@/types/Streamers.types";
import { TwitchTypes } from "@/types/Twitch.types";
import { getStreamers } from "@functions/base";
import Logs from "@libs/Logs";
import pastilleAxios from "@libs/PastilleAxios";
import TwitchAxios from "@utils/TwitchAxios";
import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
const waitingTime = 300000;

const addonsLoaded = async (guild: any, params: any) => {
  Logs("addons:twitch:start", "start", "Starting twitch addons", guild.id);

  try {
    // get stream list
    // group streamer id

    // getting auth token from twitch
    const authToken = await requestAuthenticator();

    // getting streamer id list from api
    try {
      const streamerList = await pastilleAxios.get("/twitch/streamers");

      const eventSubRegister = streamerList.data.map(
        (streamer: StreamerTypes) =>
          new Promise(async (resolve, rejet) => {
            try {
              const req = await TwitchAxios.post(
                "https://api.twitch.tv/helix/eventsub/subscriptions",
                {
                  type: "stream.online",
                  version: 1,
                  condition: {
                    broadcaster_user_id: streamer.id,
                  },
                  transport: {
                    method: "webhook",
                    callback:
                      "https://pastille.api.jeremiemeunier.fr/twitch/webhook",
                    secret: process.env.BOT_SECRET_SIG,
                  },
                },
                {
                  headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${authToken}`,
                    "Client-ID": process.env.TWITCH_CLIENT,
                  },
                }
              );

              Logs("", null, req.data);
            } catch (error: any) {
              Logs("addon:twitch", "error", error, "event_subscription");
            }
          })
      );
    } catch (error: any) {
      Logs("addon:twitch", "warning", error, "get_streamers");
    }

    // const notificationChannel = guild.channels.cache.find(
    //   (channel: any) => channel.id === params.channel
    // );
    // const notificationRole = guild.roles.cache.find(
    //   (role: any) => role.id === params.role
    // );

    // const pingStreamer = setInterval(async () => {
    //   const authToken = await requestAuthenticator();

    //   if (authToken) {
    //     streamerList.map(async (item: TwitchTypes) => {
    //       const { twitch } = item;
    //       const streamerState = await requestStreamerState(
    //         twitch.id,
    //         authToken
    //       );

    //       if (streamerState !== undefined) {
    //         if (startAnalyze(streamerState.started_at)) {
    //           try {
    //             const liveButton = new ActionRowBuilder().addComponents(
    //               new ButtonBuilder({
    //                 label: "Rejoindre sur twitch.tv",
    //                 style: ButtonStyle.Link,
    //                 url: `https://twitch.tv/${twitch.name.toString()}`,
    //               })
    //             );
    //             const liveEmbed = new EmbedBuilder({
    //               color: parseInt("6441a5", 16),
    //               title: `${twitch.name.toString()} est actuellement en live !`,
    //               description: `Il stream : **__${streamerState.title}__** sur **__${streamerState.game_name}__**`,
    //             });

    //             try {
    //               await notificationChannel.send({
    //                 content: `${twitch.name.toString()} est en live ! ${
    //                   item.message ? item.message : ""
    //                 } ${notificationRole}`,
    //                 embeds: [liveEmbed],
    //                 components: [liveButton],
    //               });
    //             } catch (error: any) {
    //               Logs("addons:twitch:send", "error", error, guild.id);
    //             }
    //           } catch (error: any) {
    //             Logs("addons:twitch:ping", "error", error, guild.id);
    //           }
    //         }
    //       }
    //     });
    //   } else {
    //     Logs("twitch:auth:global", "error", "Cannot auth to twitch");
    //   }
    // }, waitingTime);
  } catch (error: any) {
    Logs("addon:twitch", "error", error);
  }
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
        client_id: process.env.TWITCH_CLIENT,
        client_secret: process.env.TWITCH_SECRET,
        grant_type: "client_credentials",
      }
    );

    return requestToken.data.access_token;
  } catch (error: any) {
    Logs("twitch:auth", "error", error.message || error);
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
    Logs("twitch:request:state", "error", error.message || error);
  }
};

export { addonsLoaded };
