const { version, options, channels } = require ('./config/settings.json');
const { BOT_TOKEN } = require('./config/secret.json');
const { Client, EmbedBuilder, GatewayIntentBits, Partials } = require('discord.js');
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildVoiceStates],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

const { dateParser } = require('./function/base');
const { logsBooter, logsEmiter, logsTester } = require('./function/logs');
const { voiceEventInit } = require('./events/voiceEvent');
const { commandRegister, commandRegisterInit } = require('./function/commandsRegister');
const { reactionAddEventInit } = require('./events/messageReactionAddEvent');
const { reactionRemoveEventInit } = require('./events/messageReactionRemoveEvent');
const { InteractionCreateEventInit } = require('./events/interactionCreateEvent');
const { messageCreateEventInit } = require('./events/messageCreateEvent');

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
    
    const clientGuildQuantity = client.guilds.cache.map(guild => guild.id).length;
    const clientGuildIds = client.guilds.cache.map(guild => guild.id);

	try {
        let bootEmbed = new EmbedBuilder()
            .setColor(`${options.color}`)
            .setTitle(`Pastille Launch`)
            .setDescription(`It's a bot. An explosive bot named Pastille but only for an discord !`)
            .addFields(
                { name: 'Date starting', value: dateParser(), inline: true },
                { name: 'Version', value: version, inline: true },
                { name: 'Command bang', value: options.bang, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: `Version ${version}` });
        logsBooter(client, channelConsole, channelDebug);
        logsEmiter('Hello here !');

        setTimeout(() => {
            if(logsTester()) {
                commandRegisterInit(client);
                voiceEventInit(client);
                reactionAddEventInit(client);
                reactionRemoveEventInit(client);
                InteractionCreateEventInit(client);
                messageCreateEventInit(client);
                
                for(let i = 0;i < clientGuildQuantity;i++) {
                    commandRegister(clientGuildIds[i]);
                }

                // channelDebug.send({ embeds: [bootEmbed] });
            }
        }, 2000);
    }
    catch (error) { logsEmiter(`An error occured : ${error}`); }
}

client.on('ready', () => { pastilleBooter(); });
client.login(BOT_TOKEN);