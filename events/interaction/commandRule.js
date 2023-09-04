const fs = require('node:fs');
const { Events, EmbedBuilder } = require('discord.js');
const { logsEmiter } = require('../../function/logs');
const { channels, options } = require ('../../config/settings.json');

let client;

const commandRuleInit = (clientItem) => {

    client = clientItem;

    client.on(Events.InteractionCreate, async interaction => {
        if (!interaction.isChatInputCommand()) return;
            const { commandName } = interaction;
        
        if(commandName === 'rule') {
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
    });
}

module.exports = { commandRuleInit }