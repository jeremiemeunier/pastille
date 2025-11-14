import { getParams } from "@functions/Base.function";
import Logs from "@libs/Logs";
import { ButtonInteraction, Client, Events, MessageFlags } from "discord.js";

const buttonAcceptRuleInit = async ({
  client,
  interaction,
}: {
  client: Client;
  interaction: ButtonInteraction;
}) => {
  const { customId } = interaction;

  if (customId !== "acceptedRules") return;
  if (!interaction.guild) return;

  const guildParams = await getParams({ guild: interaction.guild! });
  if (!guildParams) return;

  const { moderation } = guildParams;

  const guild = client.guilds.cache.find(
    (guild: { id: any }) => guild?.id === interaction?.guildId
  );

  if (!guild) return;

  const member = guild.members.cache.find(
    (member: { id: any }) => member?.id === interaction.user?.id
  );
  const role = guild.roles.cache.find(
    (role: { id: any }) => role?.id === moderation.roles.rule
  );

  if (!member || !role) {
    interaction.reply({
      content: "Une erreur est survenue",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

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
    Logs({ node: ["event", "accept_rule"], state: "error", content: err });
    return;
  }
};

export { buttonAcceptRuleInit };
