const fs = require('node:fs');
const { Events, EmbedBuilder } = require('discord.js');
const roleSettings = JSON.parse(fs.readFileSync('./data/role.json'));
const { logsEmiter } = require('../../../function/logs');
const { options } = require ('../../../config/settings.json');

let client;

const commandRoleInit = (clientItem) => {

    client = clientItem;

    client.on(Events.InteractionCreate, async interaction => {
        if (!interaction.isChatInputCommand()) return;
            const { commandName } = interaction;
        
        if(commandName === 'role') {
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
                    catch(error) { logsEmiter(`An error occured [commandRoleInit] : \r\n ${error}`); }
                }
            }
            catch(error) { logsEmiter(`An error occured\r\n ${error}`); }
        }
    });
}

module.exports = { commandRoleInit }