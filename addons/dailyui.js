const { EmbedBuilder } = require("discord.js");
const { options } = require("../config/settings.json");
const { logs } = require("../function/logs");
const { GUILD_ID, BOT_ID } = require("../config/secret.json");
const axios = require("axios");
const addonsLoaded = async (client, addonsParamsItem) => {
  const { channel, role, params } = addonsParamsItem;
  const { hours, minutes } = params;

  setInterval(async () => {
    const actualDate = new Date();

    if (
      actualDate.getHours().toString() === hours &&
      actualDate.getMinutes().toString() === minutes
    ) {
      try {
        const dailyUiChallenge = await axios.get("/dailyui", {
          headers: { pastille_botid: BOT_ID },
        });
        const { _id, title, description } = dailyUiChallenge.data.data;
        const guild = client.guilds.cache.find(
          (guild) => guild.id === GUILD_ID
        );
        const addonsChannel = guild.channels.cache.find(
          (addonsChannel) => addonsChannel.name === channel
        );

        try {
          const embed = new EmbedBuilder({
            color: parseInt(options.color, 16),
            title: `**${title}**`,
            description: description,
          });
          const message = await addonsChannel.send({
            content: `<@&${role}> c'est l'heure du DailyUi ! N'hésitez pas à partager vos créations dans le fils`,
            embeds: [embed],
          });

          // On crée le thread lié au message
          // On change aussi le topic du channel
          try {
            addonsChannel.setTopic(`**DailyUi → ${title}** | ${description}`);
            const thread = await message.startThread({
              name: `${title}`,
              autoArchiveDuration: 60,
              reason: "Need a separate thread for daily dailyui",
            });

            try {
              const dailyUiChallenge = await axios.put(
                "/dailyui",
                {},
                { params: { id: _id }, headers: { pastille_botid: BOT_ID } }
              );
            } catch (error) {
              logs("error", "dailyui:update", error);
            }
          } catch (error) {
            logs("error", "dailyui:topics", error);
          }
        } catch (error) {
          logs("error", "dailyui:embed", error);
        }
      } catch (error) {
        logs("error", "dailyui:request", error);
      }
    }
  }, 60000);
};

module.exports = { addonsLoaded };
