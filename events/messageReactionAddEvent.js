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
  });
}

module.exports = { reactionAddEventInit }