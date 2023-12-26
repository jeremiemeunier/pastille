const { Events, EmbedBuilder } = require('discord.js');
const { logs } = require('../function/logs');
const { getParams } = require('../function/base');

const messageEditInit = (client) => {
  client.on(Events.MessageUpdate, async (oldMessage, newMessage) => {
    
  })
}

module.exports = { messageEditInit }