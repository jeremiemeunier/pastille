const { EmbedBuilder } = require('discord.js');
const { logs } = require('../logs');
const { BOT_ID } = require('../../config/secret.json');
const axios = require("axios");
const { getParams } = require('../base');
const { durationFormater } = require('./automodSanction');

const automodRemove = async (guild, user) => {
    const params = await getParams(guild);

    console.log(params);
}

const automodApply = async (guild, user, timer) => {
    const params = await getParams(guild);
}

const automodVerifier = async (guild) => {
  const guildParams = await getParams(guild);
  const { moderation } = guildParams;
  const now = Date.parse(new Date());
  const { muted } = moderation.roles;

  logs("infos", "automod:verifier", "Start sanctions verifications", guild.id);
  
  try {
    const allGuildSanctionsRequest = await axios({
      method: "get",
      url: "/sanction",
      params: {
        guild_id: guild.id
      },
      headers: {
        "pastille_botid": BOT_ID
      }
    });

    const allGuildSanctions = allGuildSanctionsRequest.data.data;
    const guildParams = await getParams(guild);
    const { moderation } = guildParams;

    if(allGuildSanctions && allGuildSanctions.length > 0) {
      allGuildSanctions.map(async (item) => {
        const { sanction, user_id } = item;
        const ending = Date.parse(new Date(sanction.ending));
        const user = await guild.members.fetch(user_id);
        const sanctionRole = guild.roles.cache.find(role => role.id === moderation.roles.muted);

        if(!user) {
          logs("warning", "automod:verifier:rebind", `User not find : ${user_id}`, guild.id); return; }
        if(!sanctionRole) {
          logs("warning", "automod:verifier:rebind", `Role not find : ${moderation.roles.muted}`, guild.id); return; }

        if(ending <= now) {
          try { await user.roles.remove(sanctionRole); }
          catch(error) { logs("error", "sanction:verifier:remove", error, guild.id); }
        }
        else {
          const newTimer = ending - now;

          try {
            const sanctionApply = setTimeout(async () => {
              const embedSanction = new EmbedBuilder()
                .setColor(options.color)
                .setTitle("Sanction terminée")
                .setDescription(`Ta sanction vient de prendre fin. Tu peux à nouveau profiter pleinement du serveur.`);
              await user.roles.remove(sanctionRole);
              await user.send({
                content: `Ta sanction sur **__${guild.name}__** vient de prend fin`,
                embeds: [embedSanction]
              });
            }, newTimer);
          }
          catch(error) { logs("error", "sanction:verifier:remove:timer", error, guild.id); }
        }
      });
    }
  }
  catch(error) { logs("error", "automod:verifier", error); }

  logs("infos", "automod:verifier", "End sanctions verifications", guild.id);
}

module.exports = { automodVerifier }