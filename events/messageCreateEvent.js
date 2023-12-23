const { Events } = require('discord.js');
const { getParams, hoursParser, dateParser } = require('../function/base');
const { bangRule } = require('./interaction/bang/bangRule');
const { bangStatus } = require('./interaction/bang/bangStatus');
const { logs } = require('../function/logs');

const messageCreateEventInit = (client) => {
  client.on(Events.MessageCreate, async (message) => {
    const content = message.content;
    const guild = client.guilds.cache.find(guild => guild.id === message.guildId);
    const channel = guild.channels.cache.find(channel => channel.id === message.channelId);

    const guildParams = await getParams(guild);
    const { options } = guildParams;

    const splitedMsg = content.split(' ');
    const cmd = splitedMsg.shift().slice(1);

    if(message.author.bot === true) { return; }
    if(content.startsWith(options.bang)) {
      if(cmd === 'regles') { bangRule(message, guild); }
      if(cmd === 'status') { bangStatus(message, guild); }
    }

    if(channel.name === options.channels.screenshots) {
      if(message.attachments.size) {
        try {
          const title = `${message.author.globalName} (${await dateParser()} ${await hoursParser()})`
          const thread = await message.startThread({
            name: title,
            autoArchiveDuration: 4320,
            reason: 'New screenshots posted'
          });
        } catch(error) { logs("error", "thread:screenshots", error); return; }
      }
    }

    return;
  });
}

module.exports = { messageCreateEventInit }