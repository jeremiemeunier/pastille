const axios = require('axios');
const { TWITCH_CLIENT_TOKEN, TWITCH_SECRET_TOKEN } = require('../config/secret.json');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { options } = require('../config/settings.json');
const { logs } = require('../function/logs');

const addonsLoaded = async (client, addonsParamsItem) => {
  const { channel, role } = addonsParamsItem;
  const { streamer } = require('../config/addons/streamer.json');
    
  setInterval(async () => {
    const authToken = await requestAuthenticator();
    streamer.map(async streamer => {
      let streamerState = await requestStreamerState(streamer.twitch.id, authToken);
      if(streamerState !== undefined) {
        if(startAnalyze(streamerState.started_at)) {
          try {
            let thumbnail = streamerState.thumbnail_url;
            thumbnail = thumbnail.replace('{width}', 1920);
            thumbnail = thumbnail.replace('{height}', 1080);

            const liveButton = new ActionRowBuilder()
              .addComponents(
                  new ButtonBuilder({
                    label: "Rejoindre sur twitch.tv",
                    style: ButtonStyle.Link,
                    url: `https://twitch.tv/${streamer.twitch.name.toString()}`
                  })
              );
            const liveEmbed = new EmbedBuilder({
              color: parseInt("6441a5"),
              title: `${streamer.twitch.name.toString()} est actuellement en live !`,
              description: `Il stream : **${streamerState.title}** sur **${streamerState.game_name}**`,
              thumbnail: thumbnail
            });
            
            client.guilds.cache.map(async guild => {
              const sendChannel = guild.channels.cache.find(sendChannel => sendChannel.name === channel);

              if(sendChannel !== undefined) {
                try {
                  await sendChannel.send({
                    content: `${streamer.twitch.name.toString()} est en live ! ${streamer.personal_text ? streamer.personal_text : ''} <@&${role}>`,
                    embeds: [liveEmbed],
                    components: [liveButton]
                  });
                }
                catch(error) { logs("error", "twitch:send", error); }
              }
            });
          }
          catch(error) { logs("error", "twitch:construct", error); }
        }
      }
    });
  }, options.wait);
}

const startAnalyze = (startItem) => {
  const now = Date.parse(new Date());
  const start = Date.parse(startItem);
  const prev = now - options.wait;
  const next = now + options.wait;

  if(start > prev && start < next) { return true; }
  else { return false; }
}

const requestAuthenticator = async () => {
  try {
    const requestToken = await axios.post("https://id.twitch.tv/oauth2/token", {}, { params: {
      client_id: TWITCH_CLIENT_TOKEN,
      client_secret: TWITCH_SECRET_TOKEN,
      grant_type: "client_credentials",
      scope: "viewing_activity_read"
    }});

    return requestToken.data.access_token;
  }
  catch(error) { logs("error", "twitch:auth", error); }
}

const requestStreamerState = async (streamerId, bearerToken) => {
  try {
      const requestState = await axios.post("https://api.twitch.tv/helix/streams", {}, {
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