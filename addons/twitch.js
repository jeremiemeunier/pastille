const axios = require('axios');
const { TWITCH_CLIENT_TOKEN, TWITCH_SECRET_TOKEN } = require('../config/secret.json');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { logs } = require('../function/logs');
const { getStreamers } = require('../function/base');
const waitingTime = 300000;

const addonsLoaded = async (guild, params) => {
  logs("start", "addons:twitch:start", "Starting twitch addons", guild.id);
  const streamerList = await getStreamers(guild);
  const notificationChannel = guild.channels.cache.find(channel => channel.id === params.channel);
  const notificationRole = guild.roles.cache.find(role => role.id === params.role);

  const pingStreamer = setInterval(async () => {
    const authToken = await requestAuthenticator();

    if(authToken) {
      streamerList.map(async (item) => {
        const { twitch } = item;
        const streamerState = await requestStreamerState(twitch.id, authToken);
  
        if(streamerState !== undefined) {
          if(startAnalyze(streamerState.started_at)) {
            try {
              const thumbnail = streamerState.thumbnail_url.replace('{width}', 1920).replace('{height}', 1080);
              const liveButton = new ActionRowBuilder()
                .addComponents(
                  new ButtonBuilder({
                    label: "Rejoindre sur twitch.tv",
                    style: ButtonStyle.Link,
                    url: `https://twitch.tv/${twitch.name.toString()}`
                  })
                );
              const liveEmbed = new EmbedBuilder({
                color: parseInt("6441a5", 16),
                title: `${twitch.name.toString()} est actuellement en live !`,
                description: `Il stream : **__${streamerState.title}__** sur **__${streamerState.game_name}__**`,
                thumbnail: { url: thumbnail.toString() }
              });

              try {
                await notificationChannel.send({
                  content: `${twitch.name.toString()} est en live ! ${item.message ? item.message : ''} ${notificationRole}`,
                  embeds: [liveEmbed],
                  components: [liveButton]
                });
              }
              catch(error) { logs("error", "addons:twitch:send", error, guild.id); }
            }
            catch(error) { logs("error", "addons:twitch:ping", error, guild.id); }
          }
        }
      });
    }
    else { logs("error", "twitch:auth:global", "Cannot auth to twitch"); }
  }, waitingTime);
}

const startAnalyze = (startItem) => {
  const now = Date.parse(new Date());
  const start = Date.parse(startItem);
  const prev = now - waitingTime;
  const next = now + waitingTime;

  if(start > prev && start < next) { return true; }
  else { return false; }
}

const requestAuthenticator = async () => {
  try {
    const requestToken = await axios({
      method: "post",
      baseURL: "https://id.twitch.tv/oauth2/token",
      params: {
        client_id: TWITCH_CLIENT_TOKEN,
        client_secret: TWITCH_SECRET_TOKEN,
        grant_type: "client_credentials",
        scope: "viewing_activity_read"
      }
    });

    return requestToken.data.access_token;
  }
  catch(error) { logs("error", "twitch:auth", error); }
}

const requestStreamerState = async (streamerId, bearerToken) => {
  try {
    const requestState = await axios({
      method: "get",
      baseURL: "https://api.twitch.tv/helix/streams",
      params: { user_id: streamerId },
      headers: {
        'client-id': TWITCH_CLIENT_TOKEN,
        'Authorization': `Bearer ${bearerToken}`
      }
    });
    return requestState.data.data[0];
  }
  catch(error) { logs("error", "twitch:request:state", error); }
}

module.exports = { addonsLoaded }