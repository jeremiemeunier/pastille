const { Events, EmbedBuilder } = require('discord.js');
const { logsEmiter } = require('../../function/logs');
const { options } = require ('../../config/settings.json');

let client;

const commandStaffInit = (clientItem) => {

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
            catch(error) { logsEmiter(`An error occured [commandStaffInit] : \r\n ${error}`); }
        }
    });
}

module.exports = { commandStaffInit }