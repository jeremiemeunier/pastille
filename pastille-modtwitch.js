const { ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, EmbedBuilder, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const settingsConfig = JSON.parse(fs.readFileSync('data/config.json'));
const settingsSecret = JSON.parse(fs.readFileSync('data/secret.json'));

// Basic function to optimal working

const startStreamVerifier = (startTime, now) => {
    if(now === undefined) { now = Date.parse(new Date()); }

        startTime = Date.parse(startTime);
    let previousTime = now - settingsConfig.app.twitch.countdown;
    let nextTime = now + settingsConfig.app.twitch.countdown;

    if(startTime > previousTime && startTime < nextTime) { return true; }
    else { return false; }
}

const pastilleHello = (debugChannel) => {
    const logTag = `pastille_bot[${settingsConfig.app.twitch.name}][${settingsConfig.app.twitch.version}]`;
    const streamerList = JSON.parse(fs.readFileSync('data/streamer.json'));
    const streamerLength = Object.keys(streamerList).length;
    let logTextDebug = "";

    logTextDebug = logTextDebug + `\`\`\`${logTag} Hi here ! I'm pastille_bot 😀\r`;
    logTextDebug = logTextDebug + `${logTag} You launch the : ${settingsConfig.app.twitch.name} module\r`;
    logTextDebug = logTextDebug + `${logTag} Now i'm listen all ${settingsConfig.app.twitch.countdown/1000}s for all following streamer :\r`;

    for(let i = 0;i < streamerLength;i++) { logTextDebug = logTextDebug + `${logTag}   - ${streamerList[i].twitch.name}\r`; }
    logTextDebug = logTextDebug + "\`\`\`";
    debugChannel.send(logTextDebug);
}

const xhrStateVerifier = (xhr) => {
    if(xhr.readyState === 4 && xhr.status === 200) { return true; }
    else { return false; }
}

const dateReturnFormater = (dat = new Date()) => {
    let dateFormated = "";

	if(dat.getHours() < 10) { dateFormated += `0${dat.getHours()}:`; } else { dateFormated += `${dat.getHours()}:`; }
	if(dat.getMinutes() < 10) { dateFormated += `0${dat.getMinutes()}:`; } else { dateFormated += `${dat.getMinutes()}:`; }
	if(dat.getSeconds() < 10) { dateFormated += `0${dat.getSeconds()}`; } else { dateFormated += `${dat.getSeconds()}`; }

	return dateFormated;
}

// ########## //

const onliveBotChecked = (params) => {
    const streamerList = JSON.parse(fs.readFileSync('data/streamer.json'));
    const streamerLength = Object.keys(streamerList).length;

    const _XHR_authBearer = new XMLHttpRequest();
    const authBearerAPI = `https://id.twitch.tv/oauth2/token?client_id=${settingsSecret.TWITCH_CLIENT_TOKEN}&client_secret=${settingsSecret.TWITCH_SECRET_TOKEN}&grant_type=client_credentials&scope=viewing_activity_read`;

    _XHR_authBearer.onreadystatechange = () => {
        if(xhrStateVerifier(_XHR_authBearer) && _XHR_authBearer.responseText !== undefined) {
            let authBearerToken = JSON.parse(_XHR_authBearer.responseText);

            for(let i = 0;i < streamerLength;i++) {
                onliveBotSender(authBearerToken, streamerList[i], params);
            }
        }
    }

    _XHR_authBearer.open('POST', authBearerAPI, false);
    _XHR_authBearer.send();
}

const onliveBotSender = (token, streamer, params) => {
    const _XHR_streamerData = new XMLHttpRequest();
    const streamerDataAPI = settingsConfig.api.twitch_stream + streamer.twitch.id;

    _XHR_streamerData.onreadystatechange = () => {
        if(xhrStateVerifier(_XHR_streamerData)) {
            let streamerData = JSON.parse(_XHR_streamerData.responseText).data[0];

            if(streamerData !== undefined) {
                if(startStreamVerifier(streamerData.started_at)) {
                    let liveButton = new ActionRowBuilder()
                                            .addComponents(
                                                new ButtonBuilder()
                                                    .setLabel('Rejoindre sur twitch.tv')
                                                    .setStyle(ButtonStyle.Link)
                                                    .setURL(`https://twitch.tv/${streamer.twitch.name.toString()}`)
                                            );
                    let liveTextMessage = `**${streamer.twitch.name.toString()}** est actuellement en live.`;
                    if(streamer.notif_line !== undefined) { liveTextMessage += `\n${data.notif_line.toString()}`; }
                    liveTextMessage += `\nIl stream : **${streamerData.title}** sur **${streamerData.game_name}** C'est pour vous <@&${params.notifsRole}> !`;

                    params.announce.send({ content: liveTextMessage, components: [liveButton] });
                }
            }
        }
    }

    _XHR_streamerData.open('GET', streamerDataAPI, true);
    _XHR_streamerData.setRequestHeader('client-id', settingsSecret.TWITCH_CLIENT_TOKEN);
    _XHR_streamerData.setRequestHeader('Authorization', 'Bearer ' + token['access_token']);
    _XHR_streamerData.send();
}

// ########## //

const pastilleBooter = () => {
	const channelAnnounce = client.channels.cache.find(channel => channel.name === settingsConfig.app.twitch.channel.announce);
	const channelDebug = client.channels.cache.find(channel => channel.name === settingsConfig.channel.debug);

    let bootEmbedMessage = new EmbedBuilder()
                                .setColor('#20A68E')
                                .setAuthor({ name: settingsConfig.app.twitch.name, iconURL: 'https://1.images.cdn.pooks.fr/github/pastillebot/pastille_avatar.png' })
                                .addFields(
                                    { name: 'Date starting', value: dateReturnFormater(new Date()), inline: true },
                                    { name: 'Debug', value: settingsConfig.debug.toString(), inline: true },
                                    { name: 'Version', value: settingsConfig.version.toString(), inline: true }
                                )
                                .setTimestamp()
                                .setFooter({ text: `Version ${settingsConfig.app.twitch.version}`, });
    channelDebug.send({ embeds: [bootEmbedMessage] });
    if(settingsConfig.app.twitch.waiting === true) {
        setInterval(() => {
            onliveBotChecked({"announce": channelAnnounce, "debug": channelDebug, "notifsRole": settingsConfig.role.livemod.toString() });
        }, settingsConfig.app.twitch.countdown);
    }

    pastilleHello(channelDebug);
}

client.on('ready', () => { pastilleBooter(); });
client.login(settingsSecret.BOT_TOKEN);