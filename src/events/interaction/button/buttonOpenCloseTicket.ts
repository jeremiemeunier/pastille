import { getParams } from "@functions/base";
import Logs from "@libs/Logs";
import { Events } from "discord.js";

const buttonOpenTicketInit = async (
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
    channelId?: any;
    reply?: any;
    customId?: any;
  }
) => {
  const { customId } = interaction;
  if (customId !== "closeTicket") {
    return;
  }

  const guildParams = await getParams(interaction.guild);
  const { moderation } = guildParams;

  const guild = client.guilds.cache.find(
    (guild: { id: any }) => guild?.id === interaction.guildId
  );
  const member = guild.members.cache.find(
    (member: { id: any }) => member.id === interaction.user.id
  );
  const channel = await guild.channels.fetch(interaction.channelId);

  if (!member.roles.cache.has(moderation.roles.staff)) {
    await interaction.reply({
      content: "Seul les membres du staff peuvent fermer un ticket",
      ephemeral: true,
    });
    return;
  }

  try {
    channel.setLocked(true);
    await interaction.reply({ content: "Channel, now lock", ephemeral: true });
  } catch (err: any) {
    Logs("close:staff:channel", "error", err, guild?.id);
  }
};

export { buttonOpenTicketInit };
