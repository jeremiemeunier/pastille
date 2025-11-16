import { getParams, getRules } from "@functions/Base.function";
import Logs from "@libs/Logs";
import { EmbedBuilder, Guild } from "discord.js";

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
  guild: Guild
) => {
  const guildParams = await getParams({ guild });
  if (!guildParams) return;

  const rules = await getRules({ guild });
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
    Logs({
      node: ["rule", "thread_voice"],
      state: "error",
      content: err,
      details: guild?.id,
    });
  }
};

export { bangRule };
