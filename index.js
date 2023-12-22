const { BOT_TOKEN, MONGODB_URL } = require('./config/secret.json');
const mongoose = require("mongoose");

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
const { commandRegisterInit, commandRegister } = require('./function/commandsRegister');
const { reactionAddEventInit } = require('./events/messageReactionAddEvent');
const { reactionRemoveEventInit } = require('./events/messageReactionRemoveEvent');
const { interactionCreateEventInit } = require('./events/interactionCreateEvent');
const { messageCreateEventInit } = require('./events/messageCreateEvent');
const { addonsRegisterInit } = require('./function/addonsRegister');
const { automod } = require('./events/messageModerationEvent');
const { automodVerifier } = require('./function/automod/automodVerifer');
const { api } = require('./function/api');

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
            logs("infos", "booter:guild", "Start all functions", guild.id);
            automodVerifier(guild);
            commandRegister(guild);
            addonsRegisterInit(guild);
        });

        voiceEventInit(client);
        reactionAddEventInit(client);
        reactionRemoveEventInit(client);
        interactionCreateEventInit(client);
        messageCreateEventInit(client);
        automod(client);
    }
    catch (error) { logs('error', 'booter', error); }

    try {
        // API
        api();
    }
    catch(error) { logs("error", "api:server:global", error); }

    client.on(Events.GuildCreate, (guild) => {
        logs('infos', 'events:new_guild', "Join a new guild", guild.id);
        commandRegister(guild);
    });
}

try {
    client.on('ready', () => { pastilleBooter(); });
    client.login(BOT_TOKEN);
}
catch(error) {
    logs("error", "client:connect", error);
}