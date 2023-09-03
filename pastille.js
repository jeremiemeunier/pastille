const fs = require('node:fs');
const alphabetLetters = JSON.parse(fs.readFileSync('data/base/alphabet.json'));
const roleSettings = JSON.parse(fs.readFileSync('data/addons/role.json'));

const { version, options, channels } = require ('./config/settings.json');
const { BOT_TOKEN } = require('./config/secret.json');
const { ChannelType, Client, Events, EmbedBuilder, GatewayIntentBits, Partials } = require('discord.js');
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
                
                for(let i = 0;i < clientGuildQuantity;i++) {
                    commandRegister(clientGuildIds[i]);
                }

                // channelDebug.send({ embeds: [bootEmbed] });
            }
        }, 2000);
    }
    catch (error) { logsEmiter(`An error occured : ${error}`); }
}

client.on(Events.MessageCreate, async (message) => {
    const content = message.content;
    const guild = client.guilds.cache.find(guild => guild.id === message.guildId);
    const channel = guild.channels.cache.find(channel => channel.id === message.channelId);
    const author = message.author.username;
    const today = new Date();
    const postedDate = `${today.getDate}/${today.getMonth}/${today.getFullYear}`;
    const msg = channel.messages.cache.find(message => message.id === message.id);

    let splitedMsg = content.split(' ');
    let cmd = splitedMsg.shift().slice(1);
    let text = splitedMsg.join(' ');

    if(message.author.bot === true) { return; }
    if(content.startsWith(options.bang)) {
        if(cmd === 'ip' || cmd === 'bichonwood') {
            message.delete();
            const embed = new EmbedBuilder()
                                    .setColor(`${options.color}`)
                                    .setTitle('Envie de nous rejoindre sur BichonWood ?')
                                    .setDescription(`Pour rejoindre le serveur créatif de BichonWood, tu doit faire une demande auprès d'un modérateur ou un admin.`)
                                    .addFields(
                                        { name: 'Version', value: '1.19.4', inline: true },
                                        { name: 'IP', value: 'minecraft.jeremiemeunier.fr', inline: true }
                                    );
            try { channel.send({ embeds: [embed] }); }
            catch(error) { logsEmiter(`An error occured\r\n ${error}`); return; }
        }
        else if(cmd === 'dailyui') {
            message.delete();
            const embed = new EmbedBuilder()
                                    .setColor(`${options.color}`)
                                    .setTitle(`Tu souhaite t'exercer à l'UI/UX ?`)
                                    .setDescription(`Pour t'ajouter le rôle des DailyUi clique sur le 🤓`);
            try {
                const message = await channel.send({ embeds: [embed] });
                message.react('🤓');
            }
            catch(error) { logsEmiter(`An error occured\r\n ${error}`); return; }
        }
    }
    else if(channel.name === channels.screenshots) {
        try {
            const thread = await message.startThread({
                name: `${author} (${today.getDay()}/${today.getMonth()}/${today.getFullYear()})`,
                autoArchiveDuration: 60,
                reason: 'New screenshots posted'
            });
        }
        catch(error) { console.log(error); }
    }
    else { return; }
});

// ##### AUTOMOD ##### \\

client.on(Events.MessageCreate, async (message) => {

});

client.on('ready', () => { pastilleBooter(); });
client.login(BOT_TOKEN);