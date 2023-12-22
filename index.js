const { BOT_TOKEN, MONGODB_URL } = require('./config/secret.json');

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

// Setup of axios
const axios = require('axios');
axios.defaults.baseURL = "http://localhost:3000";

// BDD
mongoose.connect(MONGODB_URL);

// ##### BOT SETUP ##### \\

const { Client, GatewayIntentBits, Partials, Events } = require('discord.js');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildVoiceStates],
    partials: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction],
});

const { logs } = require('./function/logs');
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
    logs('start', 'booter', 'Pastille has started successfully');

	try {
        const allGuilds = client.guilds.cache;

        allGuilds.map((guild, index) => {
            automodVerifier(guild);
        });

        commandRegisterInit(client);
        voiceEventInit(client);
        reactionAddEventInit(client);
        reactionRemoveEventInit(client);
        interactionCreateEventInit(client);
        messageCreateEventInit(client);
        automod(client);
        addonsRegisterInit(client);
    }
    catch (error) { logs('error', 'booter', error); }

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

        app.get("/", (req, res) => { res.status(200).json({ message: "Bienvenue sur le Backend de Pastille" }); });
        app.all("*", (req, res) => { res.status(404).json({ message: "This route do not exist" }); });
        app.listen(3000, () => { logs('start', 'api', `Started on port 3000`); });
    }
    catch(error) { logs("error", "api:server:global", error); }

    client.on(Events.GuildCreate, (guild) => {
        logs('infos', 'events:new_guild', `Join a new server : ${guild.id} ${guild.name}`);
        commandRegisterInit(client, guild.id);
    });
}

try {
    client.on('ready', () => { pastilleBooter(); });
    client.login(BOT_TOKEN);
}
catch(error) {
    logs("error", "client:connect", error);
}