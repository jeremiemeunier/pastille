const { Events } = require('discord.js');
const { logs } = require('../../../function/logs');
const { moderation } = require("../../../config/settings.json");

const buttonStaffRequest = (client) => {
  client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isButton()) return;
    const { customId } = interaction;
    
    if(customId === 'requestStaff') {
      const guild = client.guilds.cache.find(guild => guild.id === interaction.guildId);
      const member = guild.members.cache.find(member => member.id === interaction.user.id);

        
    }
          
  });
}

module.exports = { buttonStaffRequest }