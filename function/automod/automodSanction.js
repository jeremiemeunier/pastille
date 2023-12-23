const { EmbedBuilder } = require('discord.js');
const { moderation, options } = require('../../config/settings.json');
const { logs } = require('../logs');
const { PORT, BOT_ID } = require('../../config/secret.json');
const axios = require("axios");

const automodSanction = (user, size, guild) => {
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
    // Sanction de ban temporaire de 1 heure du serveur

  }
  else if(
    count > 33
  ) {
    // Ban définitifs du serveur

  }
}

const durationInterpreter = (sanctionData) => {
  const { duration, unit } = sanctionData;

  if (unit === 'm') { return duration * (1000 * 60); }
  else if (unit === 'h') { return duration * (1000 * 3600); }
  else if (unit === 'd') { return duration * (1000 * 3600 * 24); }
}

const durationFormater = (duration) => {
  const minutes = duration / (1000 * 60);

  if(minutes >= 60) {
      
  }
  else { return `${minutes} minutes`; }
}

const sanctionRegister = async (userId, level, start, end, guild) => {
  try {
    const register = await axios({
      method: "post",
      url: "/sanction",
      baseURL: `http://localhost:${PORT}`,
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
  }
  catch(error) { logs("error", "automod:sanction:register", error); }
}

const sanctionApplier = async (user, duration, guild) => {
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