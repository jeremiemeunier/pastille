const fs = require('node:fs');
const path = require('node:path');

const globalSettings = JSON.parse(fs.readFileSync(__dirname + '/config/settings.json'));
const { BOT_ID, BOT_TOKEN, BOT_OWNER_ID, GUILD_ID } = require(__dirname + '/config/secret.json');
const { REST, Routes, ChannelType, Client, Events, EmbedBuilder, GatewayIntentBits, Partials, ShardingManager, messageLink } = require('discord.js');
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildVoiceStates],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

// Base function for optimal working

client.on('ready', () => {
    setInterval(async () => {
        const actualDate = new Date();
        const dailyUiList = JSON.parse(fs.readFileSync(__dirname + '/data/dailyui.json'));

        if(actualDate.getHours() === 10 && actualDate.getMinutes() === 23) {
            let dailyUiAvancement = fs.readFileSync(__dirname + '/bin/dailyui.txt', 'utf8', (err, data) => {
                if(err) { console.log(err); }
                else { return data; }
            });
            let nextDailyUiAdvancement = fs.readFileSync(__dirname + '/bin/dailyui.txt', 'utf8', (err, data) => {
                if(err) { console.log(err); }
                else { return data; }
            });
                nextDailyUiAdvancement++;

            try {
                const guild = client.guilds.cache.find(guild => guild.id === GUILD_ID);
                const channel = guild.channels.cache.find(channel => channel.name === 'daily-ui');
                const embed = new EmbedBuilder()
                                    .setColor(globalSettings.options.color)
                                    .setTitle(`C'est l'heure de ton dailyUi !`)
                                    .setDescription(`Pour aujourd'hui : **${dailyUiList[dailyUiAvancement].name}**`);
                const message = await channel.send({ content: `<@&1118500573675782235> c'est l'heure du DailyUi !`, embeds: [embed] });
                try {
                    const thread = await message.startThread({
                        name: `DailyUi : ${dailyUiList[dailyUiAvancement].name}`,
                        autoArchiveDuration: 60,
                        reason: 'Need a separate thread for daily dailyui'
                    });
                    fs.writeFileSync('./bin/dailyui.txt', nextDailyUiAdvancement.toString());
                }
                catch(error) { console.log(error); }
            }
            catch(error) { console.log(error); }
        }
    }, 60000);
});
client.login(BOT_TOKEN);