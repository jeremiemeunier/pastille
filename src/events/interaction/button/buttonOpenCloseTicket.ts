import { getParams } from "@functions/Base.function";
import Logs from "@libs/Logs";
import {
  ButtonInteraction,
  Client,
  MessageFlags,
  ThreadChannel,
} from "discord.js";

const buttonOpenTicketInit = async ({
  client,
  interaction,
}: {
  client: Client;
  interaction: ButtonInteraction;
}) => {
  const { customId } = interaction;
  if (customId !== "closeTicket") {
    return;
  }

  if (!interaction.guild) return;

  const guildParams = await getParams({ guild: interaction.guild });
  if (!guildParams) return;

  const { moderation } = guildParams;

  const guild = client.guilds.cache.find(
    (guild: { id: any }) => guild?.id === interaction?.guildId
  );

  if (!guild) return;

  const member = guild.members.cache.find(
    (member: { id: any }) => member?.id === interaction.user?.id
  );
  const channel = (await guild.channels.fetch(
    interaction.channelId
  )) as ThreadChannel;

  if (!channel || !member) return;

  if (!member.roles.cache.has(moderation.roles.staff)) {
    await interaction.reply({
      content: "Seul les membres du staff peuvent fermer un ticket",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  try {
    channel.setLocked(true);
    await interaction.reply({
      content: "Channel, now lock",
      flags: MessageFlags.Ephemeral,
    });
  } catch (err: any) {
    Logs({
      node: ["close", "staff", "channel"],
      state: "error",
      content: err,
      details: guild?.id,
    });
  }
};

export { buttonOpenTicketInit };
