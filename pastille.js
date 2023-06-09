const fs = require('node:fs');
const path = require('node:path');
const secretSettings = JSON.parse(fs.readFileSync('data/secret.json'));
const globalSettings = JSON.parse(fs.readFileSync('data/config.json'));
const alphabetLetters = JSON.parse(fs.readFileSync('data/alphabet.json'));
const roleSettings = JSON.parse(fs.readFileSync('data/role/role.json'));
const commands = [];
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

const { BOT_ID, BOT_TOKEN, BOT_OWNER_ID } = require('./data/secret.json');
const { REST, Routes, ChannelType, Client, Events, EmbedBuilder, GatewayIntentBits, Partials, ShardingManager } = require('discord.js');
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildVoiceStates],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

const { createThreadOnJoin, joinThreadOnJoin, leaveThreadOnLeave, deleteThreadOnLeave } = require('./events/voice.js');
const { dateParser, logger } = require('./function/base.js');

let consoleChannel;
let debugChannel;

const autoLog = (content) => { logger(consoleChannel, content); }

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

// ##### CMD ##### \\

for(const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for(const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if('data' in command) {
            commands.push(command.data);
        } else {
            autoLog(`[WARNING] The command at ${filePath} is missing a required "data" property.`);
        }
    }
}

const commandRegister = (GUILD_ID) => {
    const rest = new REST().setToken(BOT_TOKEN);
    const guildName = client.guilds.cache.find(guild => guild.id === GUILD_ID).name;
    (async () => {
        try {
            autoLog(`Started refreshing ${commands.length} application (/) commands for ${guildName}.`);
            const data = await rest.put(
                Routes.applicationGuildCommands(BOT_ID, GUILD_ID),
                { body: commands },
            );
            autoLog(`Successfully reloaded ${data.length} application (/) commands for ${guildName}.`);
        }
        catch (error) { console.error(error); }
    })();
}

// ##### APP ##### \\

const pastilleBooter = () => {
    debugChannel = client.channels.cache.find(channel => channel.name === globalSettings.channels.debug);
    consoleChannel = client.channels.cache.find(channel => channel.name === globalSettings.channels.console);
    
    const clientGuildQuantity = client.guilds.cache.map(guild => guild.id).length;
    const clientGuildIds = client.guilds.cache.map(guild => guild.id);

	try {
        let bootEmbed = new EmbedBuilder()
                                .setColor(`${globalSettings.options.color}`)
                                .setTitle(`Pastille Launch`)
                                .setDescription(`Le bot de @dark_bichon pour effectuer l'ensemble des actions trop cool qu'il à coder`)
                                .addFields(
                                    { name: 'Date starting', value: dateParser(), inline: true },
                                    { name: 'Version', value: globalSettings.version, inline: true },
                                    { name: 'Command bang', value: globalSettings.options.bang, inline: true }
                                )
                                .setTimestamp()
                                .setFooter({ text: `Version ${globalSettings.version}` });
        debugChannel.send({ embeds: [bootEmbed] });
        autoLog('Hello here !');
        
        for(let i = 0;i < clientGuildQuantity;i++) {
            commandRegister(clientGuildIds[i]);
        }
    }
    catch (error) { autoLog(`An error occured : ${error}`); }
}

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
        const { commandName } = interaction;
    
    if(commandName === 'staff') {
        try {
            const embed = new EmbedBuilder()
                                .setColor(`${globalSettings.options.color}`)
                                .setTitle(`Demande de support`)
                                .setDescription(`Comment pouvons-nous t'aider ? Si tu as des questions ou des demandes clique sur 🎟️ pour contacter le staff`);
            const message = await interaction.reply({ embeds: [embed], fetchReply: true });
            message.react('🎟️');
        }
        catch(error) { autoLog(`An error occured\r\n ${error}`); }
    }
    else if(commandName === 'modos') {
        try {
            const embed = new EmbedBuilder()
                                .setColor(`${globalSettings.options.color}`)
                                .setDescription(`Faire une réclamation sur une décision de modération, clique sur 🤕`);
            const message = await interaction.reply({ embeds: [embed], fetchReply: true });
            message.react('🤕');
        }
        catch(error) { autoLog(`An error occured\r\n ${error}`); }
    }
    else if(commandName === 'rule') {
        try {
            const rules = new EmbedBuilder()
                                .setColor(`${globalSettings.options.color}`)
                                .setTitle('Règles du serveur')
                                .setDescription(`Les règles du serveur sont simples.\r\nEn utilisant ce serveur discord, l'utilisateur accepte d'emblée le réglement.`)
                                .addFields(
                                    { name: "🤜 Spams, menaces", value: "Pas de spam, de doxxing/menaces ou d'insultes", inline: false },
                                    { name: "📺 Torrent", value: "Pas de choses illégales (torrent de film/musique, jeux craqué)", inline: false },
                                    { name: "📖 Channel, topics", value: "Respectez les channels, topics, etc", inline: false },
                                    { name: "💗 Respect", value: "Traitez tout le monde avec respect. Aucun harcèlement, chasse aux sorcières, sexisme, racisme ou discours de haine ne sera toléré.", inline: false },
                                    { name: "📣 Pubs", value: "Pas de spam ni d'autopromotion (invitations de serveurs, publicités, etc.) sans l'autorisation d'un modérateur du serveur, y compris via les MP envoyés aux autres membres. Le salon <#882582553222082580> est prévu pour ça.", inline: false },
                                    { name: "🔞 NSFW", value: "**Ce serveur est tout public !** Pas de contenu violent, obscène ou NSFW, qu'il s'agisse de texte, d'images ou de liens mettant en scène de la nudité, du sexe, de l'hyperviolence ou un quelconque contenu dérangeant.", inline: false },
                                    { name: "\u200B", value: "Si tu remarques quelque chose de contraire aux règles ou qui te met dans un sentiment d'insécurité, informes en les modérateurs. Nous voulons que ce serveur soit accueillant pour tout le monde !", inline: false }
                                );
            const modos = new EmbedBuilder()
                                .setColor(`${globalSettings.options.color}`)
                                .setTitle('Modérations')
                                .setDescription(`Les décisions des modérateur et de l'équipe du serveur ne sont pas discutable. Si tu pense qu'elle est injuste, utilise le ticket dans <#1049836337131434016>. Pour accompagner et faciliter le travail de la modération, un automod est présent sur ce discord.`)
                                .addFields(
                                    { name: "Modération", value: "<@&882582552550965262>", inline: true },
                                    { name: "\u200B", value: "<@&1049094503157485708>", inline: true },
                                    { name: "Automod", value: "<@782207025865949194>", inline: true }
                                );
            const embed = new EmbedBuilder()
                                .setColor(`${globalSettings.options.color}`)
                                .setDescription(`Pour accepter les règles et accéder au serveur clique sur 🐶`);
            const message = await interaction.reply({ embeds: [rules, modos, embed], fetchReply: true });
            message.react('🐶');
        }
        catch(error) { autoLog(`An error occured\r\n ${error}`); }
    }
    else if(commandName === 'poll') {
        let pollChoices = '';

        for(let i = 0;i<22;i++) {
            if(interaction.options.getString(`choice_${alphabetLetters[i].letter}`) === null) {
                const embed = new EmbedBuilder()
                                    .setColor(`${globalSettings.options.color}`)
                                    .setTitle(interaction.options.getString('question'))
                                    .setDescription(pollChoices);
                const message = await interaction.reply({ embeds: [embed], fetchReply: true, content: "Nouveau sondage ! ||@here||" });
                for(let j = 0;j < i;j++) {
                    let first = interaction.options.getString(`choice_${alphabetLetters[j].letter}`).split(' ')[0];
                    let letter = alphabetLetters[j].emoji;

                    try { await message.react(first); }
                    catch(error) {
                        try { await message.react(letter); }
                        catch(error) { autoLog(`An error occured\r\n ${error}`); }
                    }
                }
                break;
            }
            else {
                pollChoices = pollChoices + `\r\n${alphabetLetters[i].emoji} ${interaction.options.getString(`choice_${alphabetLetters[i].letter}`)}`;
            }
        }
    }
    else if(commandName === 'announce') {
        try {
            const embed = new EmbedBuilder()
                                .setColor(`${globalSettings.options.color}`)
                                .setTitle(interaction.options.getString('title'))
                                .setDescription(interaction.options.getString('content'));
            const message = await interaction.reply({ embeds: [embed], fetchReply: true, content: "📢 **Annonce** ||@everyone||" });
        }
        catch(error) { autoLog(`An error occured\r\n ${error}`); }
    }
    else if(commandName === 'role') {
        let fields = [];

        for(let i = 0;i < roleSettings.length;i++) {
            const field = {
                name: `${roleSettings[i].emoji}   ${roleSettings[i].name}`, value: roleSettings[i].description, inline: true
            }
            fields.push(field);
        }

        const embed = new EmbedBuilder()
                            .setColor(`${globalSettings.options.color}`)
                            .setTitle(`Pastille autorole`)
                            .setDescription(`Clique sur les réactions en dessous de ce message pour t'ajouter les rôles en fonction de tes centres d'intérêt.`)
                            .addFields(fields);
        try {
            const message = await interaction.reply({ embeds: [embed], fetchReply: true });
            for(let i = 0;i < roleSettings.length;i++) {
                try { await message.react(roleSettings[i].emoji); }
                catch(error) { autoLog(`An error occured\r\n ${error}`); }
            }
        }
        catch(error) { autoLog(`An error occured\r\n ${error}`); }
    }
    else if(commandName === 'fils') {
        const channel = client.channels.cache.find(channel => channel.id === interaction.channelId);

        try {
            const thread = await channel.threads.create({
                name: interaction.options.getString('title'),
                autoArchiveDuration: 60,
                reason: interaction.options.getString('title'),
                type: ChannelType.PrivateThread,
            });
            await thread.members.add('936929561302675456');
            await thread.members.add(interaction.user.id);
    
            let embed = new EmbedBuilder()
                                .setColor(`${globalSettings.options.color}`)
                                .setDescription(`Create a new thread to request MidJourney`);
            const msg = await thread.send({ embeds: [embed] });
        }
        catch(error) { autoLog(`An error occured\r\n ${error}`); }
    }
});

client.on('voiceStateUpdate', async (oldState, newState) => {
    if(newState.channelId === oldState.channelId) { return; }
    else {
        const guild = client.guilds.cache.find(guild => guild.id === oldState.guild.id) ||
                      client.guilds.cache.find(guild => guild.id === newState.guild.id);
        const text = guild.channels.cache.find(text => text.name === globalSettings.channels.voiceText);
        const user = oldState.member.user.id || newState.member.user.id;

        if (newState.channelId === null) {
            const channel = guild.channels.cache.find(channel => channel.id === oldState.channelId);
            const connected = channel.members.map(x => x).length;

            if(connected === 0) { deleteThreadOnLeave(channel, text, console); }
            else { leaveThreadOnLeave(channel, text, consoleChannel, user); }
        }
        else if (oldState.channelId === null) {
            const channel = guild.channels.cache.find(channel => channel.id === newState.channelId);
            const connected = channel.members.map(x => x).length;
    
            if(connected === 1) {  createThreadOnJoin(channel, text, consoleChannel, user); }
            else { joinThreadOnJoin(channel, text, consoleChannel, user); }
        }
        else {
            const oldChannel = guild.channels.cache.find(oldChannel => oldChannel.id === oldState.channelId);
            const newChannel = guild.channels.cache.find(newChannel => newChannel.id === newState.channelId);
            const oldNbConnected = oldChannel.members.map(x => x).length;
            const newNbConnected = newChannel.members.map(x => x).length;
    
            if(oldNbConnected === 0) { deleteThreadOnLeave(oldChannel, text, consoleChannel); }
            else { leaveThreadOnLeave(oldChannel, text, consoleChannel, user); }
            if(newNbConnected === 1) { createThreadOnJoin(newChannel, text, consoleChannel, user); }
            else { joinThreadOnJoin(newChannel, text, consoleChannel, user); }
        }
    }
});

client.on(Events.MessageReactionAdd, async (reaction, user) => {
    if(user.bot === true) { return; }
    else {
        const helpZone = client.channels.cache.find(channel => channel.id === globalSettings.channels.help);
        if (reaction.partial) {
            try { await reaction.fetch(); }
            catch (error) { autoLog(`An error occured\r\n ${error}`); return; }
        }

        if(reaction.message.interaction != undefined) {
            if(reaction.message.interaction.commandName === 'rule') {
                if(reaction.emoji.name === '🐶') {
                    const guild = client.guilds.cache.find(guild => guild.id === reaction.message.guildId);
                    const member = guild.members.cache.find(member => member.id === user.id);
                    const role = guild.roles.cache.find(role => role.id === globalSettings.moderation.rule);

                    try { await member.roles.add(role); }
                    catch(error) { autoLog(`An error occured\r\n ${error}`); return; }
                }
                else { reaction.users.remove(user); }
            }
            else if(reaction.message.interaction.commandName === 'staff') {
                if(reaction.emoji.name === '🎟️') {
                    try {
                        reaction.users.remove(user);
                        const thread = await helpZone.threads.create({
                            name: `@${user.username} request help`,
                            autoArchiveDuration: 60,
                            reason: `Requested help form @${user.username}`,
                            type: ChannelType.PrivateThread,
                        });
                        await thread.members.add(user);
                        let embed = new EmbedBuilder()
                                                .setColor(`${globalSettings.options.color}`)
                                                .setTitle(`Requested help from @${user.username}`)
                                                .setDescription(`Pour mettre fin à ta demande d'aide clique sur 🔒`);
                        const message = await thread.send({ embeds: [embed] });
                        message.react('🔒');
                    }
                    catch(error) { autoLog(`An error occured\r\n ${error}`); return; }
                }
                else { reaction.users.remove(user); }
            }
            else if(reaction.message.interaction.commandName === 'voices') {

            }
            else if(reaction.message.interaction.commandName === 'role') {
                for(let i = 0;i < roleSettings.length;i++) {
                    if(reaction.emoji.name === roleSettings[i].emoji) {
                        const guild = client.guilds.cache.find(guild => guild.id === reaction.message.guildId);
                        const member = guild.members.cache.find(member => member.id === user.id);
                        const role = guild.roles.cache.find(role => role.id === roleSettings[i].role);

                        try { await member.roles.add(role); }
                        catch(error) { autoLog(`An error occured\r\n ${error}`); return; }
                    }
                }
            }
        }
        else {
            if(reaction.emoji.name === '🔒') {
                const channel = client.channels.cache.find(channel => channel.id === globalSettings.channels.help);
                const thread = channel.threads.cache.find(thread => thread.id === reaction.message.channelId);

                try {
                    thread.setLocked(true);
                    const embed = new EmbedBuilder()
                                        .setColor(`${globalSettings.options.color}`)
                                        .addFields(
                                            { name: "Archivage", value: 'Clique sur 📦 pour archiver ce fil.', inline: true },
                                            { name: "Déverouillage", value: 'Clique sur 🔓 pour débloquer ce fil.', inline: true })
                                        .setDescription(`Ce fil est maintenant verrouillé.`);
                    const message = await thread.send({ embeds: [embed]});
                    message.react('📦');
                    message.react('🔓');
                }
                catch(error) { autoLog(`An error occured\r\n ${error}`); return; }
            }
            else if(reaction.emoji.name === '📦') {
                const channel = client.channels.cache.find(channel => channel.id === globalSettings.channels.help);
                const thread = channel.threads.cache.find(thread => thread.id === reaction.message.channelId);

                try { thread.setArchived(true); } catch(error) { autoLog(`An error occured\r\n ${error}`); return; }
            }
            else if(reaction.emoji.name === '🔓') {
                const channel = client.channels.cache.find(channel => channel.id === globalSettings.channels.help);
                const thread = channel.threads.cache.find(thread => thread.id === reaction.message.channelId);

                try {
                    thread.setLocked(false);
                    const embed = new EmbedBuilder()
                                        .setColor(`${globalSettings.options.color}`)
                                        .setDescription(`Ce fil est de nouveau disponible. Pour mettre fin à ta demande clique sur 🔒`);
                    const message = await thread.send({ embeds: [embed] });
                    message.react('🔒');
                }
                catch(error) { autoLog(`An error occured\r\n ${error}`); return; }
            }
        }
    }
});

client.on(Events.MessageReactionRemove, async (reaction, user) => {
    if(user.bot === true) { return; }
    
    if (reaction.partial) {
        try { await reaction.fetch(); }
        catch (error) { autoLog(`An error occured\r\n ${error}`); return; }
    }

    if(reaction.message.interaction != undefined) {
        if(reaction.message.interaction.commandName === 'role') {
            for(let i = 0;i < roleSettings.length;i++) {
                if(reaction.emoji.name === roleSettings[i].emoji) {
                    const guild = client.guilds.cache.find(guild => guild.id === reaction.message.guildId);
                    const member = guild.members.cache.find(member => member.id === user.id);
                    const role = guild.roles.cache.find(role => role.id === roleSettings[i].role);

                    try { await member.roles.remove(role); }
                    catch(error) { autoLog(`An error occured\r\n ${error}`); return; }
                }
            }
        }
    }
});

client.on(Events.MessageCreate, async (message) => {
    const content = message.content;
    const guild = client.guilds.cache.find(guild => guild.id === message.guildId);
    const channel = guild.channels.cache.find(channel => channel.id === message.channelId);

    const msg = channel.messages.cache.find(message => message.id === message.id);
    let splitedMsg = content.split(' ');
    let cmd = splitedMsg.shift().slice(1);
    let text = splitedMsg.join(' ');

    if(message.author.bot === true) { return; }
    if(content.startsWith(globalSettings.options.bang)) {
        if(cmd === 'ip' || cmd === 'bichonwood') {
            message.delete();
            const embed = new EmbedBuilder()
                                    .setColor(`${globalSettings.options.color}`)
                                    .setTitle('Envie de nous rejoindre sur BichonWood ?')
                                    .setDescription(`Pour rejoindre le serveur créatif de BichonWood, tu doit faire une demande auprès d'un modérateur ou un admin.`)
                                    .addFields(
                                        { name: 'Version', value: '1.19.4', inline: true },
                                        { name: 'IP', value: 'minecraft.jeremiemeunier.fr', inline: true }
                                    );
            try { channel.send({ embeds: [embed] }); }
            catch(error) { autoLog(`An error occured\r\n ${error}`); return; }
        }
    }
    else { return; }
});

// ##### AUTOMOD ##### \\



client.on('ready', () => { pastilleBooter(); });
client.login(secretSettings.BOT_TOKEN);