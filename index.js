const { BOT_TOKEN, MONGODB_URL, PORT } = require('./config/secret.json');

// ##### API SETUP ##### \\

const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const morgan = require("morgan");
const mongoose = require("mongoose");

app.use(express.json());
app.use(cors());

// BDD

mongoose.connect(MONGODB_URL);

// ##### BOT SETUP ##### \\

const { version, options, channels } = require ('./config/settings.json');
const { Client, EmbedBuilder, GatewayIntentBits, Partials } = require('discord.js');
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


            addonsRegisterInit(client);
            channelDebug.send({ embeds: [bootEmbed] });
        }
    }
    catch (error) { logsEmiter(`An error occured [pastilleBooter] : ${error}`); }

    try {
        // API
        app.get("/", (req, res) => {
            res.status(200).json({ message: "Bienvenue sur le Backend de Pastille" });
        });

        // Route 404
        app.all("*", (req, res) => {
            res.status(404).json({ message: "This route do not exist" });
        });
        
        app.listen(PORT, () => {
            logsEmiter(`Server has started on port ${PORT} 🚀`);
        });
    }
    catch(error) {
        logsEmiter(`An error occured on api : ${error}`);
    }
}

client.on('ready', () => { pastilleBooter(); });
client.login(BOT_TOKEN);