const fs = require('node:fs');
const { ChannelType, Events, EmbedBuilder } = require('discord.js');
const roleSettings = JSON.parse(fs.readFileSync('./data/addons/role.json'));
const alphabetLetters = JSON.parse(fs.readFileSync('./data/base/alphabet.json'));
const { logsEmiter } = require('../function/logs');
const { channels, options } = require ('../config/settings.json');

let client;

const InteractionCreateEventInit = (clientItem) => {

    client = clientItem;

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
            const rules = JSON.parse(fs.readFileSync('./data/addons/rule.json'));
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
}

module.exports = { InteractionCreateEventInit }