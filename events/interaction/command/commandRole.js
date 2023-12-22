const fs = require('node:fs');
const { Events, EmbedBuilder } = require('discord.js');
const roleSettings = JSON.parse(fs.readFileSync('./config/data/role.json'));
const { logs } = require('../../../function/logs');
const { options } = require ('../../../config/settings.json');
const { getRoles } = require('../../../function/base');

let client;

const commandRoleInit = (client) => {
    client.on(Events.InteractionCreate, async interaction => {
        if (!interaction.isChatInputCommand()) return;
        const { commandName } = interaction;
        
        if(commandName === 'role') {
            const roles = await getRoles(interaction.guild);
            let fields = [];
    
            roles.map((item, index) => {
                fields.push({
                    name: `${item.emote} — ${item.name}`,
                    value: item.description,
                    inline: true
                });
            })
    
            const embed = new EmbedBuilder()
                .setColor(`${options.color}`)
                .setTitle(`Pastille autorole`)
                .setDescription(`Clique sur les réactions en dessous de ce message pour t'ajouter les rôles en fonction de tes centres d'intérêt.`)
                .addFields(fields);
            try {
                const message = await interaction.reply({ embeds: [embed], fetchReply: true });

                roles.map(async (item) => {
                    try { await message.react(item.emote); }
                    catch(error) { logs("error", "command:role:react", error, interaction.guild.id); }
                });
            }
            catch(error) { logs("error", "command:role:send", error, interaction.guild.id); }
        }
    });
}

module.exports = { commandRoleInit }