import { getParams, getRules } from "@functions/base";
import logs from "@functions/logs";
import { EmbedBuilder } from "discord.js";

const bangRule = async (
  message: {
    content?: any;
    guildId?: any;
    channelId: any;
    author?: { bot: boolean; globalName: any };
    attachments?: { size: any };
    startThread?: (arg0: {
      name: string;
      autoArchiveDuration: number;
      reason: string;
    }) => any;
    reply?: any;
  },
  guild: { channels: { cache: any[] }; id: any }
) => {
  const guildParams = await getParams(guild);
  const rules = await getRules(guild);
  const { options } = guildParams;

  const channel = guild.channels.cache.find(
    (channel: { id: any }) => channel.id === message.channelId
  );

  try {
    if (rules) {
      let rulesField: { name: any; value: any; inline: boolean }[] = [];
      rules.map((item: { name: any; description: any }) => {
        rulesField.push({
          name: item.name,
          value: item.description,
          inline: false,
        });
      });

      const rulesEmbed = new EmbedBuilder({
        color: parseInt(options.color, 16),
        title: "Règles du serveur",
        fields: rulesField,
      });
      await message.reply({
        content: "Rappel des règles du serveur",
        embeds: [rulesEmbed],
      });
    }
  } catch (error: any) {
    logs("error", "rule:thread_voice", error, guild.id);
  }
};

export { bangRule };
