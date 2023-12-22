const fs = require('node:fs');
const { Events } = require('discord.js');
const { logs } = require('../function/logs');

const roleSettings = JSON.parse(fs.readFileSync('./config/data/role.json'));

const reactionRemoveEventInit = (client) => {
    client.on(Events.MessageReactionRemove, async (reaction, user) => {
        if(user.bot === true) { return; }
        
        if (reaction.partial) {
            try { await reaction.fetch(); }
            catch (error) { logs("error", "reaction:remove:fetch", error); return; }
        }
    
        if(reaction.message.interaction != undefined) {
            if(reaction.message.interaction.commandName === 'role') {
                for(let i = 0;i < roleSettings.length;i++) {
                    if(reaction.emoji.name === roleSettings[i].emoji) {
                        const guild = client.guilds.cache.find(guild => guild.id === reaction.message.guildId);
                        const member = guild.members.cache.find(member => member.id === user.id);
                        const role = guild.roles.cache.find(role => role.id === roleSettings[i].role);
    
                        try { await member.roles.remove(role); }
                        catch(error) { logs("error", "reaction:remove:rule", error); return; }
                    }
                }
            }
        }
        else {
            if(reaction.emoji.name === '🤓') {
                const guild = client.guilds.cache.find(guild => guild.id === reaction.message.guildId);
                const member = guild.members.cache.find(member => member.id === user.id);
                const role = guild.roles.cache.find(role => role.id === '1118500573675782235');
    
                try { await member.roles.remove(role); }
                catch(error) { logs("error", "reaction:remove:dailyui", error); return; }
            }
        }
    });
}

module.exports = { reactionRemoveEventInit }