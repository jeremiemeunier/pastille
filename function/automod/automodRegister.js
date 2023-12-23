const { logs } = require('../logs');
const { BOT_ID } = require('../../config/secret.json');
const axios = require('axios');
const { automodSanction } = require('./automodSanction');

const automodRegister = async (user, reason, guild) => {
  const userId = user.user.id;
  const today = new Date();

  // On créer un nouveau register
  try {
    const addNewInfraction = await axios({
      method: "post",
      url: "/infraction",
      headers: {
        "pastille_botid": BOT_ID
      },
      data: {
        user_id: userId,
        reason: reason,
        date: today,
        guild_id: guild.id
      }
    });
    
    // On vérifie le nombre de warn
    try {
      const totalWarnUser = await axios({
        method: "get",
        url: "/infraction/all",
        headers: {
          "pastille_botid": BOT_ID
        },
        params: {
          user_id: userId,
          guild_id: guild.id
        }
      });

      automodSanction(user, totalWarnUser, guild);
    }
    catch(error) { logs("error", "automod:get:infractions", error, guild.id); }
  }
  catch(error) { logs("error", "automod:register", error, guild.id); }
}

module.exports = { automodRegister }