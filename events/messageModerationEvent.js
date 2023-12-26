const { Events, EmbedBuilder } = require('discord.js');
const { logs } = require('../function/logs');
const { automodRegister } = require('../function/automod/automodRegister');
const { getParams } = require('../function/base');

const automod = (client) => {
  client.on(Events.MessageCreate, async (message) => {
    const guild = client.guilds.cache.find(guild => guild.id === message.guildId);

    const guildParams = await getParams(guild);
    const { options, moderation } = guildParams;
    const { limit } = moderation;

    const mentions = message.mentions.roles.map(x => x).length + message.mentions.users.map(x => x).length;
    const user = guild.members.cache.find(user => user.id === message.author.id);
    const infractionChannel = guild.channels.cache.find(channel => channel.id === message.channelId);
    const alert = guild.channels.cache.find(channel => channel.id === moderation.channels.alert);
    const report = guild.channels.cache.find(channel => channel.id === moderation.channels.report);

    if(user === undefined) { return; }

    try {
      if (
        isImune(user, moderation.immune) ||
        message.author.bot === true ||
        message.author.system === true) { return; }

      if(mentions > limit.mention && mentions > 0 && limit.mention > -1) {
        try {
          const embedProof = new EmbedBuilder({
            color: parseInt(options.color, 16),
            description: message.content
          });
          const embedSanction = new EmbedBuilder({
            color: parseInt(options.color, 16),
            title: `${user.user.username} [${user.user.globalName}] a reçu un avertissement`,
            description: "**Raison** : Trop de mentions"
          });
          message.delete();

          await report.send({
            embeds: [embedSanction, embedProof] });
          await infractionChannel.send({
            content: `<@${user.user.id.toString()}> you receive a warn`,
            embeds: [embedSanction] });
          await user.send({
            content: `<@${user.user.id.toString()}> you receive a warn`,
            embeds: [embedSanction] });
          automodRegister(user, 'limitMention', guild);
        }
        catch(error) { logs("error", "automod:mention", error); }
        return;
      }
      else if(message.mentions.everyone === true) {
        try {
          const embedProof = new EmbedBuilder({
            color: parseInt(options.color, 16),
            description: message.content
          });
          const embedSanction = new EmbedBuilder({
            color: parseInt(options.color, 16),
            title: `${user.user.username} [${user.user.globalName}] a reçu un avertissement`,
            description: "**Raison** : Mentionne @everyone"
          });
          message.delete();
          await report.send({ embeds: [embedSanction, embedProof] });
          await infractionChannel.send({
            content: `<@${user.user.id.toString()}> receive a warn`,
            embeds: [embedSanction] });
          await user.send({
            content: `<@${user.user.id.toString()}> you receive a warn`,
            embeds: [embedSanction] });
          automodRegister(user, 'mentionEveryone', guild);
        }
        catch(error) { logs("error", "automod:everyone", error); }
        return;
      }
    }
    catch(error) { logs("error", "automod", error); }
  });
}

const isImune = (user, imune) => {
  const userRoles = user.roles.cache;
  let imunised = [];

  if(imune) {
    userRoles.map(role => {
      if(imune.indexOf(role.id) !== -1) { imunised.push(role.id); }
    });
  }

  if(imunised.length > 0) { return true; }
  return false;
}

module.exports = { automod }