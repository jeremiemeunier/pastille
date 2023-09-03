const fs = require('node:fs');
const alphabetLetters = JSON.parse(fs.readFileSync('data/base/alphabet.json'));
const roleSettings = JSON.parse(fs.readFileSync('data/addons/role.json'));

const { version, options, channels, moderation, app } = require ('./config/settings.json');
const { BOT_ID, BOT_TOKEN, BOT_OWNER_ID, GUILD_ID } = require('./config/secret.json');
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
        // channelDebug.send({ embeds: [bootEmbed] });
        logsBooter(client, channelConsole, channelDebug);
        logsEmiter('Hello here !');

        setTimeout(() => {
            if(logsTester()) {
                commandRegisterInit(client);
                voiceEventInit(client);
                reactionAddEventInit(client);
                
                for(let i = 0;i < clientGuildQuantity;i++) {
                    commandRegister(clientGuildIds[i]);
                }
            }
        }, 2000);
    }
    catch (error) { logsEmiter(`An error occured : ${error}`); }
}

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;
        const { commandName } = interaction;
    
    if(commandName === 'staff') {
        try {
            const embed = new EmbedBuilder()
                                .setColor(`${options.color}`)
                                .setTitle(`Demande de support`)
                                .setDescription(`Comment pouvons-nous t'aider ? Si tu as des questions ou des demandes clique sur ${options.reaction.ticket} pour contacter le staff`);
            const message = await interaction.reply({ embeds: [embed], fetchReply: true });
            message.react(options.reaction.ticket);
        }
        catch(error) { logsEmiter(`An error occured\r\n ${error}`); }
    }
    else if(commandName === 'rule') {
        const rules = JSON.parse(fs.readFileSync('data/addons/rule.json'));
        try {
            let rulesField = [];

            for(let i = 0;i < rules.length;i++) {
                const ruleField = {
                    name: `${rules[i].title}`, value: rules[i].value, inline: false
                }
                rulesField.push(ruleField);
            }
            const rulesEmbed = new EmbedBuilder()
                                    .setColor(`${options.color}`)
                                    .setTitle('Règles du serveur')
                                    .setDescription(`Les règles du serveur sont simples.\r\nEn utilisant ce serveur discord, l'utilisateur accepte d'emblée le réglement.`)
                                    .addFields(rulesField);
            const modosEmbed = new EmbedBuilder()
                                    .setColor(`${options.color}`)
                                    .setTitle('Modérations')
                                    .setDescription(`Les décisions des modérateur et de l'équipe du serveur ne sont pas discutable. Si tu pense qu'elle est injuste, utilise le ticket dans <#${channels.help}>. Pour accompagner et faciliter le travail de la modération, un automod est présent sur ce discord.`);
            const validateEmbed = new EmbedBuilder()
                                    .setColor(`${options.color}`)
                                    .setDescription(`Pour accepter les règles et accéder au serveur clique sur ${options.reaction.rule}`);
            const message = await interaction.reply({ embeds: [rulesEmbed, modosEmbed, validateEmbed], fetchReply: true });
            message.react(options.reaction.rule);
        }
        catch(error) { logsEmiter(`An error occured\r\n ${error}`); }
    }
    else if(commandName === 'poll') {
        let pollChoices = '';

        for(let i = 0;i<22;i++) {
            if(interaction.options.getString(`choice_${alphabetLetters[i].letter}`) === null) {
                const embed = new EmbedBuilder()
                                    .setColor(`${options.color}`)
                                    .setTitle(interaction.options.getString('question'))
                                    .setDescription(pollChoices);
                const message = await interaction.reply({ embeds: [embed], fetchReply: true, content: "Nouveau sondage ! ||@here||" });
                for(let j = 0;j < i;j++) {
                    let first = interaction.options.getString(`choice_${alphabetLetters[j].letter}`).split(' ')[0];
                    let letter = alphabetLetters[j].emoji;

                    try { await message.react(first); }
                    catch(error) {
                        try { await message.react(letter); }
                        catch(error) { logsEmiter(`An error occured\r\n ${error}`); }
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
                                .setColor(`${options.color}`)
                                .setTitle(interaction.options.getString('title'))
                                .setDescription(interaction.options.getString('content'));
            const message = await interaction.reply({ embeds: [embed], fetchReply: true, content: "📢 **Annonce** ||@everyone||" });
        }
        catch(error) { logsEmiter(`An error occured\r\n ${error}`); }
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
                            .setColor(`${options.color}`)
                            .setTitle(`Pastille autorole`)
                            .setDescription(`Clique sur les réactions en dessous de ce message pour t'ajouter les rôles en fonction de tes centres d'intérêt.`)
                            .addFields(fields);
        try {
            const message = await interaction.reply({ embeds: [embed], fetchReply: true });
            for(let i = 0;i < roleSettings.length;i++) {
                try { await message.react(roleSettings[i].emoji); }
                catch(error) { logsEmiter(`An error occured\r\n ${error}`); }
            }
        }
        catch(error) { logsEmiter(`An error occured\r\n ${error}`); }
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
            await interaction.reply({ content: `Tu as maintenant accès au thread ${thread}`, ephemeral: true });
    
            let embed = new EmbedBuilder()
                                .setColor(`${options.color}`)
                                .setDescription(`Create a new thread to request MidJourney`);
            const msg = await thread.send({ embeds: [embed] });
        }
        catch(error) {
            logsEmiter(`An error occured\r\n ${error}`);
            await interaction.reply({ content: `Une erreur est survenue. Essayer à nouveau plus tard.`, ephemeral: true });
        }
    }
});

client.on(Events.MessageReactionRemove, async (reaction, user) => {
    if(user.bot === true) { return; }
    
    if (reaction.partial) {
        try { await reaction.fetch(); }
        catch (error) { logsEmiter(`An error occured\r\n ${error}`); return; }
    }

    if(reaction.message.interaction != undefined) {
        if(reaction.message.interaction.commandName === 'role') {
            for(let i = 0;i < roleSettings.length;i++) {
                if(reaction.emoji.name === roleSettings[i].emoji) {
                    const guild = client.guilds.cache.find(guild => guild.id === reaction.message.guildId);
                    const member = guild.members.cache.find(member => member.id === user.id);
                    const role = guild.roles.cache.find(role => role.id === roleSettings[i].role);

                    try { await member.roles.remove(role); }
                    catch(error) { logsEmiter(`An error occured\r\n ${error}`); return; }
                }
            }
        }
    }
    else {
        if(reaction.emoji.name === '🤓') {
            const guild = client.guilds.cache.find(guild => guild.id === reaction.message.guildId);
            const member = guild.members.cache.find(member => member.id === user.id);
            const role = guild.roles.cache.find(role => role.id === '1118500573675782235');

            try { await member.roles.remove(role); }
            catch(error) { console.log(error); }
        }
    }
});

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