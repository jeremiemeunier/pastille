const { EmbedBuilder } = require('discord.js');
const { logs } = require('../logs');
const { PORT, BOT_ID } = require('../../config/secret.json');
const axios = require("axios");
const { getParams } = require('../base');
const { automodApply, automodFinalNotify } = require('./automodVerifer');

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

    automodApply(guild, user, duration);
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

    automodApply(guild, user, duration);
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

    automodApply(guild, user, duration);
    sanctionRegister(user.user.id, 'hight', startTime, endTime, guild);
  }
  else if(
    count > 27
  ) {
    // Ban définitifs du serveur
    await automodFinalNotify(guild, user);
    guild.members.ban(user);
  }
}

const durationInterpreter = (sanctionData) => {
  const { duration, unit } = sanctionData;

  if (unit === 'm') { return duration * (1000 * 60); }
  else if (unit === 'h') { return duration * (1000 * 3600); }
  else if (unit === 'd') { return duration * (1000 * 3600 * 24); }
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
  }
  catch(error) { logs("error", "automod:sanction:register:api", error, guild); }
}

module.exports = { automodSanction }