const fs = require('node:fs');
const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { logs } = require('../../../function/logs');
const { channels, options } = require ('../../../config/settings.json');
const { getRules } = require('../../../function/base');

const commandRuleInit = (client) => {
    client.on(Events.InteractionCreate, async interaction => {
        if (!interaction.isChatInputCommand()) return;
        const { commandName } = interaction;
        
        if(commandName === 'rule') {
            const rules = await getRules(interaction.guild);
            const channel = interaction.channel;

            try {
                let rulesField = [];

                rules.map((item, index) => {
                    rulesField.push({
                        name: item.name,
                        value: item.description,
                        inline: false
                    });
                });

                const acceptRuleButton = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setLabel('Accepter le réglement')
                            .setStyle(ButtonStyle.Primary)
                            .setCustomId('acceptedRules')
                    );
                
                const rulesEmbed = new EmbedBuilder()
                    .setColor(`${options.color}`)
                    .setTitle('Règles du serveur')
                    .setDescription(`Les règles du serveur sont simples.\r\nEn utilisant ce serveur discord, l'utilisateur accepte d'emblée le réglement.`)
                    .addFields(rulesField);
                const modosEmbed = new EmbedBuilder()
                    .setColor(`${options.color}`)
                    .setTitle('Modérations')
                    .setDescription(`Les décisions des modérateur et de l'équipe du serveur ne sont pas discutable. Pour accompagner et faciliter le travail de la modération, un automod est présent sur ce discord.`);
                const updateEmbed = new EmbedBuilder()
                    .setColor(`${options.color}`)
                    .setDescription(`Les modérateurs ou les admins du serveur peuvent à tout moment et sans communication supplémentaire faire évoluer le réglement.`);
                const message = await channel.send({
                    embeds: [rulesEmbed, modosEmbed, updateEmbed],
                    components: [acceptRuleButton] });
                interaction.reply({ content: 'Les règles ont bien été envoyé', ephemeral: true });
            }
            catch(error) {
                logs("error", "rule:embed", error, interaction.guild.id);
            }
        }
    });
}

module.exports = { commandRuleInit }