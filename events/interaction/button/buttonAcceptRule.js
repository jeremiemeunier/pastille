const { Events } = require("discord.js");
const { logs } = require("../../../function/logs");
const { getParams } = require("../../../function/base");

const buttonAcceptRuleInit = async (client, interaction) => {
  const { customId } = interaction;
  if (customId !== "acceptedRules") {
    return;
  }

  const guildParams = await getParams(interaction.guild);
  const { moderation } = guildParams;

  const guild = client.guilds.cache.find(
    (guild) => guild.id === interaction.guildId
  );
  const member = guild.members.cache.find(
    (member) => member.id === interaction.user.id
  );
  const role = guild.roles.cache.find(
    (role) => role.id === moderation.roles.rule
  );

  try {
    await member.roles.add(role);
    interaction.reply({
      content: "Tu as bien accepté les règles",
      ephemeral: true,
    });
  } catch (error) {
    interaction.reply({ content: "Une erreur est survenue", ephemeral: true });
    logs("error", "event:accept_rule", error);
    return;
  }
};

module.exports = { buttonAcceptRuleInit };
