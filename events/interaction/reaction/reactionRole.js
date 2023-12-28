const { getRoles } = require("../../../function/base");
const { logs } = require('../../../function/logs');

const addRole = async (client, reaction, user) => {
  const guild = client.guilds.cache.find(guild => guild.id === reaction.message.guildId);
  const member = guild.members.cache.find(member => member.id === user.id);

  const roles = await getRoles(guild);

  roles.map(async (item) => {
    const { emote } = item;
    
    if(reaction.emoji.name === emote) {
      const roleItem = guild.roles.cache.find(role => role.id === item.role);

      try { await member.roles.add(roleItem); }
      catch(error) { logs("error", "reaction:role:add", error, reaction.message.guildId); return; }
    }
  });
}

const removeRole = async (client, reaction, user) => {
  const guild = client.guilds.cache.find(guild => guild.id === reaction.message.guildId);
  const member = guild.members.cache.find(member => member.id === user.id);

  const roles = await getRoles(guild);

  roles.map(async (item) => {
    const { emote } = item;
    
    if(reaction.emoji.name === emote) {
      const roleItem = guild.roles.cache.find(role => role.id === item.role);

      try { await member.roles.remove(roleItem); }
      catch(error) { logs("error", "reaction:role:remove", error, reaction.message.guildId); return; }
    }
  });
}

module.exports = { addRole, removeRole }