const { BOT_TOKEN, MONGODB_URL, PORT } = require('./config/secret.json');

// ##### API SETUP ##### \\

const express = require("express");
const app = express();
const RateLimit = require('express-rate-limit');
const cors = require("cors");
const mongoose = require("mongoose");

const limiter = RateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
})

app.use(limiter);
app.use(express.json());
app.use(cors());

// BDD

mongoose.connect(MONGODB_URL);

// ##### BOT SETUP ##### \\

const { options, channels } = require ('./config/settings.json');
const { version } = require('./package.json');
const { Client, EmbedBuilder, GatewayIntentBits, Partials, Events } = require('discord.js');
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildVoiceStates],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

const { dateParser } = require('./function/base');
const { logsBooter, logsEmiter, logsTester } = require('./function/logs');
const { voiceEventInit } = require('./events/voiceEvent');
const { commandRegisterInit } = require('./function/commandsRegister');
const { reactionAddEventInit } = require('./events/messageReactionAddEvent');
const { reactionRemoveEventInit } = require('./events/messageReactionRemoveEvent');
const { interactionCreateEventInit } = require('./events/interactionCreateEvent');
const { messageCreateEventInit } = require('./events/messageCreateEvent');
const { addonsRegisterInit } = require('./function/addonsRegister');
const { automod } = require('./events/messageModerationEvent');
const { automodVerifier } = require('./function/automod/automodVerifer');

// ##### FIX ##### \\

if (!String.prototype.endsWith) {
    Object.defineProperty(String.prototype, 'endsWith', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function (searchString, position) {
            position = position || this.length;
            position = position - searchString.length;
            var lastIndex = this.lastIndexOf(searchString);
            return lastIndex !== -1 && lastIndex === position;
        }
    });
}

// ##### APP ##### \\

const pastilleBooter = async () => {
    const channelDebug = client.channels.cache.find(channel => channel.name === channels.debug);
    const channelConsole = client.channels.cache.find(channel => channel.name === channels.console);

	try {
        let bootEmbed = new EmbedBuilder()
            .setColor(`${options.color}`)
            .setTitle(`Pastille Launch`)
            .setDescription(`It's a bot. An explosive bot named Pastille but only for discord !`)
            .addFields(
                { name: 'Date starting', value: dateParser(), inline: true },
                { name: 'Version', value: version, inline: true },
                { name: 'Command bang', value: options.bang, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: `Version ${version}` });
        logsBooter(client, channelConsole, channelDebug);
        logsEmiter('Hello here !');

        if(logsTester()) {
            commandRegisterInit(client);
            voiceEventInit(client);
            reactionAddEventInit(client);
            reactionRemoveEventInit(client);
            interactionCreateEventInit(client);
            messageCreateEventInit(client);

            automod(client);
            automodVerifier(client);

            addonsRegisterInit(client);
            channelDebug.send({ embeds: [bootEmbed] });
        }
    }
    catch (error) { logsEmiter(`An error occured [pastilleBooter] : ${error}`); }

    try {
        // API
        const infractionRoute = require('./routes/infraction');
        const sanctionRoute = require('./routes/sanction');
        const dailyuiRoute = require('./routes/dailyui');
        const twitchpingRoute = require('./routes/twitch');

        app.use(infractionRoute);
        app.use(sanctionRoute);
        app.use(dailyuiRoute);
        app.use(twitchpingRoute);

        app.get("/", (req, res) => {
            res.status(200).json({ message: "Bienvenue sur le Backend de Pastille" });
        });

        // Route 404
        app.all("*", (req, res) => {
            res.status(404).json({ message: "This route do not exist" });
        });
        
        app.listen(PORT, () => {
            logsEmiter(`API Server : 🚀 | Started on port ${PORT}`);
        });
    }
    catch(error) {
        logsEmiter(`API Server : ⚠️  | An error occured on api : ${error}`);
    }

    client.on(Events.GuildCreate, (guild) => {
        logsEmiter(`Join a new server : ${guild.id} ${guild.name}`);
        commandRegisterInit(client, guild.id);
    });
}

try {
    client.on('ready', () => { pastilleBooter(); });
    client.login(BOT_TOKEN);
}
catch(error) {
    console.log(error);
}