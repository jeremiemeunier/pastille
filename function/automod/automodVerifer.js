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
    const allSanctions = await axios({
      method: "get",
      url: "/sanction",
      params: {
        guild: guild.id
      },
      headers: {
        "pastille_botid": BOT_ID
      }
    });

    if(allSanctions) {
      const { items } = allSanctions.data;
      
      items.map(async (item, index) => {
        const { sanction, user_id, guild_id } = item;
        const ending = Date.parse(new Date(sanction.ending));

        const guild = client.guilds.cache.find(guild => guild.id === guild_id);
        const user = await client.users.fetch(user_id);
        // const sanctionRole = guild.roles.cache.find(role => role.id === muted);

        if(user) {
          if(ending <= now) {
            console.log("C'est déjà good on enlève le rôle")
          }
          else {
            const newTimer = ending - now;

            setTimeout(() => {
              console.log("Sanction fini on enlève le rôle");
            }, newTimer);
          }
        }
        else { logs("warning", "automod:verifier:rebind", `User not find : ${user_id}`); }
      })
    }
    else { logs("infos", "automod:verifier", "No sanction in database"); }
  }
  catch(error) { logs("error", "automod:verifier", error); }

  logs("infos", "automod:verifier", "End sanctions verifications", guild.id);
}

module.exports = { automodVerifier }