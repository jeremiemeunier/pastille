const axios = require('axios');
const { TWITCH_CLIENT_TOKEN, TWITCH_SECRET_TOKEN } = require('../config/secret.json');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { options } = require('../config/settings.json');
const { logsEmiter } = require('../function/logs');

let client;

const addonsLoaded = async (clientItem, addonsParamsItem) => {

    client = clientItem;
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
                                    new ButtonBuilder()
                                        .setLabel('Rejoindre sur twitch.tv')
                                        .setStyle(ButtonStyle.Link)
                                        .setURL(`https://twitch.tv/${streamer.twitch.name.toString()}`)
                                );
                        const liveEmbed = new EmbedBuilder()
                                .setColor(options.color)
                                .setTitle(`${streamer.twitch.name.toString()} est actuellement en live !`)
                                .setDescription(`Il stream : **${streamerState.title}** sur **${streamerState.game_name}**`)
                                .setThumbnail(thumbnail);
                        
                        client.guilds.cache.map(async guild => {
                            const sendChannel = guild.channels.cache.find(sendChannel => sendChannel.name === channel);

                            await sendChannel.send({
                                content: `${streamer.twitch.name.toString()} est en live ! <@&${role}>`,
                                embeds: [liveEmbed],
                                components: [liveButton]
                            });
                        });
                    }
                    catch(error) { logsEmiter(error); }
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

    return true;

    if(start > prev && start < next) { return true; }
    else { return false; }
}

const requestAuthenticator = async () => {
    try {
        const requestToken = await axios({
            method: "post",
            url: "https://id.twitch.tv/oauth2/token",
            params: {
                client_id: TWITCH_CLIENT_TOKEN,
                client_secret: TWITCH_SECRET_TOKEN,
                grant_type: "client_credentials",
                scope: "viewing_activity_read"
            }
        });

        return requestToken.data.access_token;
    }
    catch(error) { logsEmiter(error.reponse); }
}

const requestStreamerState = async (streamerId, bearerToken) => {
    try {
        const requestState = await axios({
            url: "https://api.twitch.tv/helix/streams",
            type: "post",
            params: {
                user_id: streamerId
            },
            headers: {
                'client-id': TWITCH_CLIENT_TOKEN,
                'Authorization': `Bearer ${bearerToken}`
            }
        });

        return requestState.data.data[0];
    }
    catch(error) { logsEmiter(error.response); }
}

module.exports = { addonsLoaded }