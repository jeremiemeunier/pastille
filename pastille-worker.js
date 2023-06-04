const fs = require('fs');
let secretSettings = JSON.parse(fs.readFileSync('data/secret.json'));
let globalSettings = JSON.parse(fs.readFileSync('data/config.json'));
let alphabetLetters = JSON.parse(fs.readFileSync('data/alphabet.json'));

const { ChannelType, Client, Events, EmbedBuilder, GatewayIntentBits, Partials, ShardingManager } = require('discord.js');
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildVoiceStates],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

const { createThreadOnJoin, joinThreadOnJoin, leaveThreadOnLeave, deleteThreadOnLeave } = require('./events/voice.js');
const { dateParser, logger } = require('./function/base.js');

let consoleChannel;
let debugChannel;
const tag = `pastille_bot[${globalSettings.version}] `;

// ##### APP ##### \\

const autoLog = (content) => { logger(tag, consoleChannel, content); }

const pastilleBooter = () => {
    debugChannel = client.channels.cache.find(channel => channel.name === globalSettings.channels.debug);
    consoleChannel = client.channels.cache.find(channel => channel.name === globalSettings.channels.console);

	try {
        let bootEmbed = new EmbedBuilder()
                                .setColor(`${globalSettings.options.color}`)
                                .setDescription(`${globalSettings.app.worker.name}`)
                                .addFields(
                                    { name: 'Date starting', value: dateParser(), inline: true },
                                    { name: 'Version', value: globalSettings.version, inline: true },
                                    { name: 'Command bang', value: globalSettings.options.bang, inline: true }
                                )
                                .setTimestamp()
                                .setFooter({ text: `Version ${globalSettings.version}`, });
        // debugChannel.send({ embeds: [bootEmbed] });
        autoLog('Hello here !');
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
                                .setDescription(`Pour contacter le staff cliquer sur 🎟️`);
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
});

client.on('voiceStateUpdate', async (oldState, newState) => {
    if(newState.channelId === oldState.channelId) { return; }
    else {
        const guild = client.guilds.cache.find(guild => guild.id === oldState.guild.id) ||
                      client.guilds.cache.find(guild => guild.id === newState.guild.id);
        const text = guild.channels.cache.find(text => text.name === globalSettings.channels.voiceText);

        if (newState.channelId === null) {
            const channel = guild.channels.cache.find(channel => channel.id === oldState.channelId);
            const connected = channel.members.map(x => x).length;

            if(connected === 0) { deleteThreadOnLeave(channel, text, console); }
            else { leaveThreadOnLeave(channel, text, console, oldState.member.user.id); }
        }
        else if (oldState.channelId === null) {
            const channel = guild.channels.cache.find(channel => channel.id === newState.channelId);
            const connected = channel.members.map(x => x).length;
    
            if(connected === 1) {  createThreadOnJoin(channel, text, console, oldState.member.user.id); }
            else { joinThreadOnJoin(channel, text, console, newState.member.user.id); }
        }
        else {
            const oldChannel = guild.channels.cache.find(oldChannel => oldChannel.id === oldState.channelId);
            const newChannel = guild.channels.cache.find(newChannel => newChannel.id === newState.channelId);
            const oldNbConnected = oldChannel.members.map(x => x).length;
            const newNbConnected = newChannel.members.map(x => x).length;
    
            if(oldNbConnected === 0) { deleteThreadOnLeave(oldChannel, text, console); }
            else { leaveThreadOnLeave(oldChannel, text, oldState.member.user.id); }
            if(newNbConnected === 1) { createThreadOnJoin(newChannel, text, console, newState.member.user.id); }
            else { joinThreadOnJoin(newChannel, text, newState.member.user.id); }
        }
    }
});

client.on(Events.MessageReactionAdd, async (reaction, user) => {
    if(user.username === 'pastille_bot') { return; }
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
        }
        else {
            if(reaction.emoji.name === '🔒') {
                let channel = client.channels.cache.find(channel => channel.id === globalSettings.channels.help);
                let thread = channel.threads.cache.find(thread => thread.id === reaction.message.channelId);

                try {
                    thread.setLocked(true);
                    let embed = new EmbedBuilder()
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
                let channel = client.channels.cache.find(channel => channel.id === globalSettings.channels.help);
                let thread = channel.threads.cache.find(thread => thread.id === reaction.message.channelId);

                try { thread.setArchived(true); } catch(error) { autoLog(`An error occured\r\n ${error}`); return; }
            }
            else if(reaction.emoji.name === '🔓') {
                let channel = client.channels.cache.find(channel => channel.id === globalSettings.channels.help);
                let thread = channel.threads.cache.find(thread => thread.id === reaction.message.channelId);

                try {
                    thread.setLocked(false);
                    let embed = new EmbedBuilder()
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

client.on('ready', () => { pastilleBooter(); });
client.login(secretSettings.BOT_TOKEN);
