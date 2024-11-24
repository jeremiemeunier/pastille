import { StreamerAnnouncerTypes, StreamerTypes } from "@/types/Streamers.types";
import Logs from "@libs/Logs";
import pastilleAxios from "@libs/PastilleAxios";
import TwitchAxios from "@utils/TwitchAxios";
import cron from "node-cron";
import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import Streamers from "@models/Streamers";
const waitingTime = 300000;

const AddonTwitch = async (client: any) => {
  Logs("addons:twitch:start", "start", "Starting twitch addons");

  try {
    // getting auth token from twitch
    let authToken = await requestAuthenticator();

    // getting streamer id list from api
    try {
      const streamerList = await pastilleAxios.get("/twitch/streamers");

      streamerList.data.map(
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

              Logs("addon:twitch", null, req.data, "subscription.created");
              resolve("subscription.created");
            } catch (error: any) {
              Logs("addon:twitch", "error", error, "event_subscription");
            }
          })
      );
    } catch (error: any) {
      Logs("addon:twitch", "warning", error, "get_streamers");
    }

    // now launch cron task
    cron.schedule("* * * * *", async () => {
      try {
        // getting all up and unannounced stream
        const req = await pastilleAxios.get("/twitch/live");

        if (!authToken) authToken = await requestAuthenticator();

        if (req.data && req.data.length > 0) {
          // map list
          const notifications = req.data.map(
            (live: StreamerTypes) =>
              new Promise(async (resolve, reject) => {
                // parse all announcer
                const { announcer } = live;

                const annoucing = announcer.map(
                  async (recipient: StreamerAnnouncerTypes) =>
                    new Promise<StreamerTypes>(async (resolve, reject) => {
                      // define recipient informations
                      const guild = client.guilds.cache.find(
                        (guild: any) => guild.id === recipient.guild_id
                      );
                      const channel = guild.channels.cache.find(
                        (channel: any) => channel.id === recipient.channel_id
                      );
                      const role = guild.roles.cache.find(
                        (role: any) => role.id === recipient.role_id
                      );

                      // get stream infos
                      const stream = await requestStreamerState(
                        live.id,
                        authToken
                      );

                      if (stream) {
                        // build announce items
                        try {
                          const liveButton =
                            new ActionRowBuilder().addComponents(
                              new ButtonBuilder({
                                label: "Rejoindre sur twitch.tv",
                                style: ButtonStyle.Link,
                                url: `https://twitch.tv/${stream.user_login.toString()}`,
                              })
                            );
                          const liveEmbed = new EmbedBuilder({
                            color: parseInt("6441a5", 16),
                            title: `${stream.user_name.toString()} est actuellement en live !`,
                            description: `Il stream : **__${stream.title}__** sur **__${stream.game_name}__**`,
                          });

                          try {
                            await channel.send({
                              content: `${stream.user_name.toString()} est en live ! ${
                                recipient.message ? recipient.message : ""
                              } ${role}`,
                              embeds: [liveEmbed],
                              components: [liveButton],
                            });
                          } catch (error: any) {
                            Logs(
                              "addons:twitch:send",
                              "error",
                              error,
                              guild.id
                            );
                          }
                        } catch (error: any) {
                          Logs("addons:twitch:ping", "error", error, guild.id);
                        }
                      } else {
                        try {
                          await Streamers.findOneAndUpdate(
                            { id: live.id },
                            { isLive: false }
                          );
                        } catch (error: any) {
                          Logs(
                            "module:twitch",
                            "error",
                            error,
                            "update_is_live_state"
                          );
                        }
                      }

                      resolve(live);
                    })
                );

                await Promise.all(annoucing)
                  .then(async (value) => {
                    value.map(async (item) => {
                      try {
                        await Streamers.findOneAndUpdate(
                          { id: item.id },
                          { isAnnounce: true }
                        );
                      } catch (error: any) {
                        Logs(
                          "module:twitch",
                          "error",
                          error,
                          "update_is_live_state"
                        );
                      }
                    });
                  })
                  .catch((error) => Logs("", "error", error));
                resolve("notif.send");
              })
          );

          await Promise.all(notifications).catch((error) =>
            Logs("", "error", error)
          );
        }
      } catch (error: any) {
        if (error.http_response !== 404) {
          Logs("module:twitch", "error", error);
        }
      }
    });
  } catch (error: any) {
    Logs("addon:twitch", "error", error);
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
          "Client-Id": process.env.TWITCH_CLIENT,
          Authorization: `Bearer ${bearerToken}`,
        },
      }
    );
    return requestState.data.data[0];
  } catch (error: any) {
    Logs("twitch:request:state", "error", error.message || error);
  }
};

export { AddonTwitch };
