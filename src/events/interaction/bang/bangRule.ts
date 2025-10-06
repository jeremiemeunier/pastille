import { getParams, getRules } from "@functions/base";
import Logs from "@libs/Logs";
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
  const guildParams = await getParams({ guild: guild.id });
  if (!guildParams) return;

  const rules = await getRules({ guild: guild.id });
  if (!rules) return;

  const { options } = guildParams;

  const channel = guild.channels.cache.find(
    (channel: { id: any }) => channel?.id === message.channelId
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
        color:
          options.color !== ""
            ? parseInt(options.color, 16)
            : parseInt("E84A95", 16),
        title: "Règles du serveur",
        fields: rulesField,
      });
      await message.reply({
        content: "Rappel des règles du serveur",
        embeds: [rulesEmbed],
      });
    }
  } catch (err: any) {
    Logs("rule:thread_voice", "error", err, guild?.id);
  }
};

export { bangRule };
