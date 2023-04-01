const { ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, EmbedBuilder, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const settingsConfig = JSON.parse(fs.readFileSync('data/config.json'));
const settingsSecret = JSON.parse(fs.readFileSync('data/secret.json'));

// Basic function to optimal working

const startStreamVerifier = (startTime, now) => {
    if(now === undefined) { now = Date.parse(new Date()); }

    let previousTime = now - settingsConfig.app.twitch.countdown;
    let nextTime = now + settingsConfig.app.twitch.countdown;

    if(startTime > previousTime && startTime < nextTime) { return true; }
    else { return false; }
}

const pastilleHello = () => {
    const terminalLogTag = `\x1b[34mpastille_bot[\x1b[0m${settingsConfig.app.twitch.name}\x1b[34m][\x1b[0m${settingsConfig.app.twitch.version}\x1b[34m]\x1b[0m`;
    const textLogTag = `pastille_bot[${settingsConfig.app.twitch.name}][${settingsConfig.app.twitch.version}]`;

    console.log(`${terminalLogTag} Hi here ! I'm pastille_bot 😀`);
    console.log(`${terminalLogTag} You launch the : \x1b[34m${settingsConfig.app.twitch.name}\x1b[0m module`);
    console.log(`${terminalLogTag} Now i'm listen all \x1b[34m${settingsConfig.app.twitch.countdown/1000}s\x1b[0m for all following streamer :`);

    const streamerList = JSON.parse(fs.readFileSync('data/streamer.json'));
    const streamerLength = Object.keys(streamerList).length;

    for(let i = 0;i < streamerLength;i++) {
        console.log(`${terminalLogTag}   - ${streamerList[i].twitch.name}`);
    }
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

const pastilleLogger = (content, timed = true) => {
    const terminalLogTag = `\x1b[34mpastille_bot[\x1b[0m${settingsConfig.app.twitch.name}\x1b[34m][\x1b[0m${settingsConfig.app.twitch.version}\x1b[34m]\x1b[0m`;
    const textLogTag = `pastille_bot[${settingsConfig.app.twitch.name}][${settingsConfig.app.twitch.version}]`;
}

// ########## //

const onliveBotChecked = (params) => {
    const streamerList = JSON.parse(fs.readFileSync('data/streamer.json'));
    const streamerLength = Object.keys(streamerList).length;

    const _XHR_authBearer = new XMLHttpRequest();
    const authBearerAPI = `https://id.twitch.tv/oauth2/token?client_id=${settingsSecret.TWITCH_CLIENT_TOKEN}&client_secret=${settingsSecret.TWITCH_SECRET_TOKEN}&grant_type=client_credentials&scope=viewing_activity_read`;

    _XHR_authBearer.onreadystatechange = (e) => {
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

    _XHR_streamerData.onreadystatechange = (e) => {
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
	let channelAnnounce = client.channels.cache.find(channel => channel.name === settingsConfig.channel.live);
	let channelDebug = client.channels.cache.find(channel => channel.name === settingsConfig.channel.debug);

    let bootEmbedMessage = new EmbedBuilder()
                                .setColor('#277CCB')
                                .setAuthor({ name: settingsConfig.app.twitch.name, iconURL: 'https://1.images.cdn.pooks.fr/github/pastillebot/pastille_avatar.png' })
                                .addFields(
                                    { name: 'Date starting', value: dateReturnFormater(new Date()), inline: true },
                                    { name: 'Debug', value: settingsConfig.debug.toString(), inline: true },
                                    { name: 'Version', value: settingsConfig.version.toString(), inline: true },
                                    { name: 'Announce channel', value: channelAnnounce.toString(), inline: false },
                                    { name: 'Announce role', value: '<@&' + settingsConfig.role.livemod.toString() + '>', inline: false }
                                )
                                .setTimestamp()
                                .setFooter({ text: `Version ${settingsConfig.app.twitch.version}`, });
    channelDebug.send({ embeds: [bootEmbedMessage] });
    if(settingsConfig.app.twitch.waiting === true) {
        setInterval(() => {
            onliveBotChecked({"announce": channelAnnounce, "debug": channelDebug, "notifsRole": settingsConfig.role.livemod.toString() });
        }, settingsConfig.app.twitch.countdown);
    }

    pastilleHello();
}

client.on('ready', () => { pastilleBooter(); });
client.login(settingsSecret.BOT_TOKEN);