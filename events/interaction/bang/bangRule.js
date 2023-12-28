const { EmbedBuilder } = require('discord.js');
const { logs } = require('../../../function/logs');
const { getRules, getParams } = require('../../../function/base');

const bangRule = async (message, guild) => {
  const guildParams = await getParams(guild);
  const rules = await getRules(guild);
  const { options } = guildParams;

  const channel = guild.channels.cache.find(channel => channel.id === message.channelId);

  try {
    if(rules) {
      let rulesField = [];
      rules.map((item) => {
        rulesField.push({
          name: item.name,
          value: item.description,
          inline: false
        });
      });

      const rulesEmbed = new EmbedBuilder({
        color: parseInt(options.color, 16),
        title: "Règles du serveur",
        fields: rulesField
      });
      await message.reply({ content: "Rappel des règles du serveur", embeds: [rulesEmbed] });
    }
  }
  catch(error) { logs("error", "rule:thread_voice", error, guild.id); }
}

module.exports = { bangRule }