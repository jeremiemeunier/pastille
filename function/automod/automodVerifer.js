const { logs } = require('../logs');
const { BOT_ID } = require('../../config/secret.json');
const axios = require("axios");
const { getParams } = require('../base');

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

            try {
              const sanctionApply = setTimeout(async () => {
                await user.roles.remove(sanctionRole);
              }, newTimer);
            }
            catch(error) { logs("error", "sanction:verifier:remove:timer", error, guild.id); }
          }
        }
      });
    }
  }
  catch(error) { logs("error", "automod:verifier", error); }

  logs("infos", "automod:verifier", "End sanctions verifications", guild.id);
}

module.exports = { automodVerifier }