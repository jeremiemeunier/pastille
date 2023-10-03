const { Events } = require('discord.js');
const { logsEmiter } = require('../../../function/logs');
const { moderation } = require("../../../config/settings.json");

let client;

const buttonAcceptRuleInit = (clientItem) => {

    client = clientItem;

    client.on(Events.InteractionCreate, async interaction => {
        if (!interaction.isButton()) return;
        const { customId } = interaction;
        
        if(customId === 'acceptedRules') {
            const guild = client.guilds.cache.find(guild => guild.id === interaction.guildId);
            const member = guild.members.cache.find(member => member.id === interaction.user.id);
            const role = guild.roles.cache.find(role => role.id === moderation.roles.rule);

            try {
                await member.roles.add(role);
                interaction.reply({ content: 'Tu as bien accepté les règles', ephemeral: true });
            }
            catch(error) {
                interaction.reply({ content: 'Une erreur est survenue', ephemeral: true });
                logsEmiter(`An error occured [reactionAddEventInit:rule] : \r\n ${error}`); return;
            }
        }
            
    });
}

module.exports = { buttonAcceptRuleInit }