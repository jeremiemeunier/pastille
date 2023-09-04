const { Events, EmbedBuilder } = require('discord.js');
const { logsEmiter } = require('../../function/logs');

let client;

const commandAnnounceInit = (clientItem) => {

    client = clientItem;

    client.on(Events.InteractionCreate, async interaction => {
        if (!interaction.isChatInputCommand()) return;
            const { commandName } = interaction;
        
        if(commandName === 'announce') {
            try {
                const embed = new EmbedBuilder()
                                    .setColor(`${options.color}`)
                                    .setTitle(interaction.options.getString('title'))
                                    .setDescription(interaction.options.getString('content'));
                const message = await interaction.reply({ embeds: [embed], fetchReply: true, content: "📢 **Annonce** ||@everyone||" });
            }
            catch(error) { logsEmiter(`An error occured\r\n ${error}`); }
        }
    });
}

module.exports = { commandAnnounceInit }