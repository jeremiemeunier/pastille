import { EmbedBuilder } from "discord.js";
import pastilleAxios from "@libs/PastilleAxios";
import Logs from "@libs/Logs";

const addonsLoaded = async (guild: any, addonsParamsItem: any) => {
  const { role, params, guild_id } = addonsParamsItem;
  const { hours, minutes } = params;

  setInterval(async () => {
    const actualDate = new Date();

    if (
      actualDate.getHours().toString() === hours &&
      actualDate.getMinutes().toString() === minutes
    ) {
      try {
        const dailyUiChallenge = await pastilleAxios.get("/dailyui", {
          headers: { pastille_botid: process.env.BOT_ID },
          params: { guild_id: guild_id },
        });
        const { _id, title, description } = dailyUiChallenge.data;
        const addonsChannel = guild.channels.cache.find(
          (channel: any) => channel?.id === addonsParamsItem.channel
        );

        try {
          const embed = new EmbedBuilder({
            color: parseInt("50F8B1", 16),
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
            await message.startThread({
              name: `${title}`,
              autoArchiveDuration: 60,
              reason: "Need a separate thread for daily dailyui",
            });

            try {
              await pastilleAxios.put(
                "/dailyui",
                {},
                {
                  params: { id: _id },
                  headers: { pastille_botid: process.env.BOT_ID },
                }
              );
            } catch (err: any) {
              Logs(["dailyui", "update"], "error", err);
            }
          } catch (err: any) {
            Logs(["dailyui", "topics"], "error", err);
          }
        } catch (err: any) {
          Logs(["dailyui", "embed"], "error", err);
        }
      } catch (err: any) {
        Logs(["dailyui", "request"], "error", err);
      }
    }
  }, 60000);
};

export { addonsLoaded };
