import { getParams } from "@functions/Base.function";
import Logs from "@libs/Logs";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  EmbedBuilder,
  Events,
  MessageFlags,
} from "discord.js";

const lockableThread = async (thread: { locked: any }, guild: any) => {
  const guildParams = await getParams({ guild: guild.id });
  if (!guildParams) return;

  if (!thread.locked) {
    try {
      const lockButton = new ActionRowBuilder().addComponents(
        new ButtonBuilder({
          label: "Fermer le ticket",
          style: ButtonStyle.Primary,
          custom_id: "closeTicket",
        })
      );
      return lockButton;
    } catch (err: any) {
      Logs(["reaction", "thread", "lock"], "error", err);
      return false;
    }
  } else {
    try {
      const unlockButton = new ActionRowBuilder().addComponents(
        new ButtonBuilder({
          label: "Réouvrir le ticket",
          style: ButtonStyle.Primary,
          custom_id: "openTicket",
        })
      );
      return unlockButton;
    } catch (err: any) {
      Logs(["reaction", "thread", "unlock"], "error", err);
      return false;
    }
  }
};

const buttonStaffRequest = async (
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
    guildId?: any;
    user?: any;
    channelId?: any;
    reply?: any;
    customId?: any;
  }
) => {
  const { customId } = interaction;
  if (customId !== "requestStaff") return;

  const guild = client.guilds.cache.find(
    (guild: { id: any }) => guild?.id === interaction?.guildId
  );
  const member = guild.members.cache.find(
    (member: { id: any }) => member?.id === interaction.user?.id
  );
  const channel = guild.channels.cache.find(
    (channel: { id: any }) => channel?.id === interaction.channelId
  );

  const guildParams = await getParams({ guild: guild.id });
  if (!guildParams) return;

  const { options, moderation } = guildParams;

  const activeRequest = channel.threads.cache.find(
    (thread: { name: string; locked: boolean }) =>
      thread.name === `Ticket pour ${member.user.username}` &&
      thread.locked === false
  );

  if (activeRequest) {
    await interaction.reply({
      content: `Une demande est déjà en cours. ${activeRequest}`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  try {
    const staffThread = await channel.threads.create({
      name: `Ticket pour ${member.user.username}`,
      autoArchiveDuration: 60,
      reason: `Create thread contact staff for ${member.user.username}`,
      type: ChannelType.PrivateThread,
      invitable: false,
    });

    const staffCall = new EmbedBuilder({
      color:
        options.color !== ""
          ? parseInt(options.color, 16)
          : parseInt("E84A95", 16),
      title: "Nouvelle demande de contact",
      description: `Nouvelle demande de **__${member.user.username}__**`,
    });
    const lockButton = new ActionRowBuilder().addComponents(
      new ButtonBuilder({
        label: "Fermer le ticket",
        style: ButtonStyle.Primary,
        custom_id: "closeTicket",
      })
    );

    await staffThread.send({
      content: `<@&${moderation.roles.staff}> nouvelle demande de contact`,
      embeds: [staffCall],
      components: [lockButton],
    });
    if (await lockableThread(staffThread, guild)) {
      await staffThread.members.add(member?.id);
      await interaction.reply({
        content: `Ta demande de contact à été créée. Tu as maintenant accès au fil ${staffThread}`,
        flags: MessageFlags.Ephemeral,
      });
    } else {
      try {
        await staffThread.delete();
      } catch (err: any) {
        Logs(["staff", "thread", "delete"], "error", err, guild?.id);
      }
    }
  } catch (err: any) {
    Logs(["staff", "button", "thread"], "error", err, guild?.id);
    await interaction.reply({
      content: `Une erreur s'est produite.`,
      flags: MessageFlags.Ephemeral,
    });
  }
};

export { buttonStaffRequest };
