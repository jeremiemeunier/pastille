const fs = require('node:fs');
const { Events, EmbedBuilder } = require('discord.js');
const { logs } = require('../function/logs');
const { addRole } = require('./interaction/reaction/reactionRole');
const { pollReactions } = require('./interaction/reaction/reactionPoll');

const reactionAddEventInit = (client) => {
  client.on(Events.MessageReactionAdd, async (reaction, user) => {
    if(user.bot === true) { return; }
    if (reaction.partial) {
      try { await reaction.fetch(); }
      catch (error) { logs(`An error occured on fetch\r\n ${error}`); return; }
    }
    
    if(reaction.message.interaction != undefined) {
      if(reaction.message.interaction.commandName === 'role') {
        addRole(client, reaction, user);
      }
      if(reaction.message.interaction.commandName === 'poll') {
        pollReactions(client, reaction, user);
      }
    }
    // else {
    //   if(reaction.emoji.name === '🔒') {
    //     const channel = client.channels.cache.find(channel => channel.id === channels.help);
    //     const thread = channel.threads.cache.find(thread => thread.id === reaction.message.channelId);

    //                 try {
    //                     thread.setLocked(true);
    //                     const embed = new EmbedBuilder()
    //                         .setColor(`${options.color}`)
    //                         .addFields(
    //                             { name: "Suppression", value: 'Clique sur 🗑️ pour supprimer ce fil.', inline: true },
    //                             { name: "Déverouillage", value: 'Clique sur 🔓 pour débloquer ce fil.', inline: true })
    //                         .setDescription(`Ce fil est maintenant verrouillé.`);
    //                     const message = await thread.send({ embeds: [embed]});
    //                     message.react('🗑️');
    //                     message.react('🔓');
    //                 }
    //                 catch(error) { logs("error", "reaction:thread:lock", error); return; }
    //             }
    //             else if(reaction.emoji.name === '🗑️') {
    //                 const channel = client.channels.cache.find(channel => channel.id === channels.help);
    //                 const thread = channel.threads.cache.find(thread => thread.id === reaction.message.channelId);
    //                 const embed = new EmbedBuilder()
    //                                         .setColor(`${options.color}`)
    //                                         .setDescription(`Ce fil va être supprimé dans quelques secondes`);
    //                 const message = await thread.send({ embeds: [embed]});
    
    //                 setTimeout(async () => {
    //                     try { thread.delete(true); }
    //                     catch(error) { logs("error", "reaction:thread:delete", error); return; }
    //                 }, 30000);
    //             }
    //             else if(reaction.emoji.name === '🔓') {
    //                 const channel = client.channels.cache.find(channel => channel.id === channels.help);
    //                 const thread = channel.threads.cache.find(thread => thread.id === reaction.message.channelId);
    
    //                 try {
    //                     thread.setLocked(false);
    //                     const embed = new EmbedBuilder()
    //                         .setColor(`${options.color}`)
    //                         .setDescription(`Ce fil est de nouveau disponible. Pour mettre fin à ta demande clique sur 🔒`);
    //                     const message = await thread.send({ embeds: [embed] });
    //                     message.react('🔒');
    //                 }
    //                 catch(error) { logs("error", "reaction:thread:unlock", error); return; }
    //             }
    //             else if(reaction.emoji.name === '🤓') {
    //                 const guild = client.guilds.cache.find(guild => guild.id === reaction.message.guildId);
    //                 const member = guild.members.cache.find(member => member.id === user.id);
    //                 const role = guild.roles.cache.find(role => role.id === '1118500573675782235');
    
    //                 try { await member.roles.add(role); }
    //                 catch(error) { logs("error", "reaction:add_role:dailyui", error); return; }
    //             }
    //         }
    //     }
  });
}

module.exports = { reactionAddEventInit }