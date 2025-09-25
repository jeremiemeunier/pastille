import { getParams } from "@functions/base";
import Logs from "@libs/Logs";
import { Events, MessageFlags } from "discord.js";

const buttonAcceptRuleInit = async (
  client: {
    on?: (arg0: Events, arg1: (interaction: any) => Promise<void>) => void;
    guilds?: any;
  },
  interaction: {
    isButton?: () => any;
    isChatInputCommand?: () => any;
    isUserContextMenuCommand?: () => any;
    isMessageContextMenuCommand?: () => any;
    isModalSubmit?: () => any;
    guild?: any;
    guildId?: any;
    user?: any;
    reply?: any;
    customId?: any;
  }
) => {
  const { customId } = interaction;
  if (customId !== "acceptedRules") return;

  const guildParams = await getParams(interaction.guild);
  const { moderation } = guildParams;

  const guild = client.guilds.cache.find(
    (guild: { id: any }) => guild?.id === interaction.guildId
  );
  const member = guild.members.cache.find(
    (member: { id: any }) => member.id === interaction.user.id
  );
  const role = guild.roles.cache.find(
    (role: { id: any }) => role.id === moderation.roles.rule
  );

  try {
    await member.roles.add(role);
    interaction.reply({
      content: "Tu as bien accepté les règles",
      flags: MessageFlags.Ephemeral,
    });
  } catch (err: any) {
    interaction.reply({
      content: "Une erreur est survenue",
      flags: MessageFlags.Ephemeral,
    });
    Logs("event:accept_rule", "error", err);
    return;
  }
};

export { buttonAcceptRuleInit };
