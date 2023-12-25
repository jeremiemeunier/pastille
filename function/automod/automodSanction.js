const { EmbedBuilder } = require('discord.js');
const { logs } = require('../logs');
const { PORT, BOT_ID } = require('../../config/secret.json');
const axios = require("axios");
const { getParams } = require('../base');

const automodSanction = async (user, size, guild) => {
  const guildParams = await getParams(guild);
  const { moderation } = guildParams;
  const { sanctions } = moderation;
  const { count } = size.data;

  if(
    count === 3 ||
    count === 6 ||
    count === 9) {
    // Sanction temporaire de mute LEVEL: low
    const { low } = sanctions;
    const duration = durationInterpreter(low)
    const startTime = new Date();
    const endTime = new Date(Date.parse(new Date()) + duration);

    sanctionApplier(user, duration, guild);
    sanctionRegister(user.user.id, 'low', startTime, endTime, guild);
  }
  else if(
    count === 12 ||
    count === 15 ||
    count === 18
  ) {
    // Sanction temporaire de mute LEVEL: medium
    const { medium } = sanctions;
    const duration = durationInterpreter(medium)
    const startTime = new Date();
    const endTime = new Date(Date.parse(new Date()) + duration);

    sanctionApplier(user, duration, guild);
    sanctionRegister(user.user.id, 'medium', startTime, endTime, guild);
  }
  else if(
    count === 21 ||
    count === 24 ||
    count === 27
  ) {
    // Sanction temporaire de mute LEVEL: hight
    const { hight } = sanctions;
    const duration = durationInterpreter(hight)
    const startTime = new Date();
    const endTime = new Date(Date.parse(new Date()) + duration);

    sanctionApplier(user, duration, guild);
    sanctionRegister(user.user.id, 'hight', startTime, endTime, guild);
  }
  else if(
    count === 27 ||
    count === 30 ||
    count === 33
  ) {
    // Sanction de ban temporaire de 10 minutes du serveur
    user.timeout(600_000);
  }
  else if(
    count > 33
  ) {
    // Ban définitifs du serveur
    guild.members.ban(user);
  }
}

const durationInterpreter = (sanctionData) => {
  const { duration, unit } = sanctionData;

  if (unit === 'm') { return duration * (1000 * 60); }
  else if (unit === 'h') { return duration * (1000 * 3600); }
  else if (unit === 'd') { return duration * (1000 * 3600 * 24); }
}

const durationFormater = (time) => {
  const duration = time / 1000;
  const days = Math.floor(duration / (24 * 3600));

  const calcHours = (days, duration) => {
    const response = Math.floor((duration - (days * (24 * 3600))) / 3600);
    return response;
  }

  const calcMinutes = (days, hours, duration) => {
    const response = Math.floor((duration - (days * (24 * 3600)) - (hours * 3600)) / 60);
    return response;
  }

  const hours = calcHours(days, duration);
  const minutes = calcMinutes(days, hours, duration);

  return `${days} jour${days > 1 ? "s" : ""}, ${hours} heure${hours > 1 ? "s" : ""}, ${minutes} minute${minutes > 1 ? "s" : ""}`;
}

const sanctionRegister = async (userId, level, start, end, guild) => {
  try {
    const register = await axios({
      method: "post",
      url: "/sanction/add",
      headers: {
        "pastille_botid": BOT_ID
      },
      data: {
        user_id: userId,
        guild_id: guild.id,
        level: level,
        date: start,
        end: end,
      }
    });

    console.log(register.data.data);
  }
  catch(error) { logs("error", "automod:sanction:register:api", error, guild); }
}

const sanctionApplier = async (user, duration, guild) => {
  const guildParams = await getParams(guild);
  const { options, moderation } = guildParams;

  try {
    const sanctionRole = guild.roles.cache.find(role => role.id === moderation.roles.muted);

    try { await user.roles.add(sanctionRole); }
    catch(error) { logs("error", "automod:sanction:add:role", error, guild.id); }

    const textualDuration = durationFormater(duration);
    const embedSanction = new EmbedBuilder()
      .setColor(options.color)
      .setTitle("Nouvelle sanction")
      .setDescription(`Tu es timeout pour ${textualDuration}, tu ne peux plus envoyer de message ou parler dans les channel vocaux jusqu'à la fin de ta sanction.`);
    
    try {
      await user.send({
        content: `<@${user.user.id.toString()}> you receive a sanction`,
        embeds: [embedSanction] });
    }
    catch(error) { logs("error", "automod:sanction:notice", error, guild.id); }

    try {
      const applySanction = setTimeout(() => {
        user.roles.remove(sanctionRole);
      }, duration);
    }
    catch(error) { logs("error", "automod:sanction:remove:timer", error, guild.id); }
  }
  catch(error) { logs("error", "automod:sanction:applier:send", error, guild.id); }
}

module.exports = { automodSanction }