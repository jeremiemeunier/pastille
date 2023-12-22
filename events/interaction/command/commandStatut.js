const { Events, ActivityType } = require('discord.js');
const { logs } = require('../../../function/logs');

let client;

const commandStatutInit = (clientItem) => {

    client = clientItem;

    client.on(Events.InteractionCreate, async interaction => {
        if (!interaction.isChatInputCommand()) return;
            const { commandName } = interaction;
        
        if(commandName === 'statut') {
            try {
                client.user.setPresence({
                    activities: [{ name: interaction.options.getString('content'),
                    type: ActivityType.Custom
                }] });
                await interaction.reply({ content: `Le nouveau nouveau statut de ${client.user} a été définis`, ephemeral: true });
            }
            catch(error) { logs("error", "command:status", error); }
        }
    });
}

module.exports = { commandStatutInit }