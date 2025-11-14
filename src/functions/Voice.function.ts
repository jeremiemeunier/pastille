import {
  ChannelType,
  EmbedBuilder,
  Guild,
  GuildMember,
  TextChannel,
  VoiceChannel,
} from "discord.js";
import { getParams } from "./Base.function";
import Logs from "@libs/Logs";

export const haveVoiceThread = async ({
  channel,
  threadChannel,
}: {
  channel: VoiceChannel;
  threadChannel: any;
}) => {
  try {
    const thread = threadChannel.threads.cache.find(
      (thread: any) => thread.name === `Voice : ${channel.name}`
    );

    if (thread) {
      return true;
    }

    return false;
  } catch (err: any) {
    Logs({
      node: ["voice", "thread", "find", "existing"],
      state: "error",
      content: err,
      details: channel.id,
    });
  }
};

/**
 * Create a new thread on first join on voice channel
 */
export const createVoiceThread = async ({
  guild,
  channel,
  threadChannel,
  user,
}: {
  guild: Guild;
  channel: VoiceChannel;
  threadChannel: TextChannel;
  user: GuildMember;
}) => {
  const guildParams = await getParams({ guild: guild });
  if (!guildParams) return;

  const { options } = guildParams;
  const threadAlreadyExist = await haveVoiceThread({
    channel: channel,
    threadChannel: threadChannel,
  });

  try {
    if (!threadAlreadyExist) {
      try {
        const thread = await threadChannel.threads.create({
          name: `Voice : ${channel.name}`,
          autoArchiveDuration: 4320,
          reason: `Dedicated text channel for the voice channel ${channel.name}`,
          type: ChannelType.PrivateThread,
          invitable: false,
        });
        await thread.members.add(user);

        const embedExplicative = new EmbedBuilder({
          color:
            options.color !== ""
              ? parseInt(options.color, 16)
              : parseInt("E84A95", 16),
          title: "Ce salon est dédié à votre channel vocal actuel.",
          description: `- Il sera automatiquement supprimé une fois que tout le monde aura quitté le channel.\n- Chaque personne qui rejoint est automatiquement ajoutée au fil.\n- Chaque personne qui quitte le channel vocal est retirée du fil automatiquement.\n- L'automodération est toujours présente même ici. Tu **doit** donc respecter les règles du serveur.\n**Les commandes**\n- Pour un rappel des règles tu peux faire **!regles** directement depuis ce fil`,
        });
        const embed = new EmbedBuilder({
          color: 32768,
          description: `<@${user}> tu as rejoint un salon vocal 🎙️`,
        });
        await thread.send({
          embeds: [embed, embedExplicative],
        });
      } catch (err: any) {
        Logs({
          node: ["voice", "thread", "create"],
          state: "error",
          content: err,
          details: channel.id,
        });
      }
    }
  } catch (err: any) {
    Logs({
      node: ["voice", "thread", "find", "existing"],
      state: "error",
      content: err,
      details: channel.id,
    });
  }
};

/**
 * Add user to thread on join voice channel
 */
export const joinVoiceThread = async ({
  guild,
  channel,
  threadChannel,
  user,
}: {
  guild: Guild;
  channel: VoiceChannel;
  threadChannel: TextChannel;
  user: GuildMember;
}) => {
  try {
    const thread = threadChannel.threads.cache.find(
      (thread: any) => thread.name === `Voice : ${channel.name}`
    );

    if (thread) {
      await thread.members.add(user);
      const embed = new EmbedBuilder({
        color: 32768,
        description: `<@${user}> tu as rejoint le salon vocal 🎙️`,
      });
      await thread.send({ embeds: [embed] });
    }
  } catch (err: any) {
    Logs({
      node: ["voice", "thread", "join"],
      state: "error",
      content: err,
      details: channel.id,
    });
  }
};

/**
 * Add all user to thread on join voice channel
 */
export const joinAllVoiceThread = async ({
  channel,
  threadChannel,
  user,
}: {
  channel: VoiceChannel;
  threadChannel: TextChannel;
  user: String;
}) => {
  try {
    const thread = threadChannel.threads.cache.find(
      (thread: any) => thread.name === `Voice : ${channel.name}`
    );

    if (thread) {
      channel.members.map(async (member: GuildMember) => {
        if (member?.id !== user) {
          try {
            await thread.members.add(member);
            const embed = new EmbedBuilder({
              color: 32768,
              description: `${member} tu as été ajouté à ce fils dédié 🎙️`,
            });
            await thread.send({ embeds: [embed] });
          } catch (err: any) {
            Logs({
              node: ["voice", "thread", "join", "all"],
              state: "error",
              content: err,
              details: channel.id,
            });
          }
        }
      });
    }
  } catch (err: any) {
    Logs({
      node: ["voice", "thread", "join"],
      state: "error",
      content: err,
      details: channel.id,
    });
  }
};

/**
 * Remove user to thread on join voice channel
 */

export const leaveVoiceThread = async ({
  guild,
  channel,
  threadChannel,
  user,
}: {
  guild: Guild;
  channel: VoiceChannel;
  threadChannel: TextChannel;
  user: GuildMember;
}) => {
  try {
    const thread = threadChannel.threads.cache.find(
      (thread) => thread.name === `Voice : ${channel.name}`
    );

    if (!thread) return;
    if (!user) return;

    await thread.members.remove(user.id);
    const embed = new EmbedBuilder({
      color: 16711680,
      description: `<@${user.id}> a quitté ce salon vocal 💨`,
    });
    const message = await thread.send({ embeds: [embed] });
  } catch (err: any) {
    Logs({
      node: ["voice", "thread", "leave"],
      state: "error",
      content: err,
      details: channel.id,
    });
  }
};

/**
 * Deleting thread on last user leave voice channel
 */
export const deleteVoiceThread = async ({
  guild,
  channel,
  threadChannel,
}: {
  guild: Guild;
  channel: VoiceChannel;
  threadChannel: TextChannel;
}) => {
  const guildParams = await getParams({ guild: guild });
  if (!guildParams) return;

  try {
    const thread = threadChannel.threads.cache.find(
      (thread: any) => thread.name === `Voice : ${channel.name}`
    );

    if (!thread) return;

    try {
      await thread.delete();
    } catch (err: any) {
      Logs({
        node: ["voice", "thread", "delete", "timeout"],
        state: "error",
        content: err,
        details: channel.id,
      });
    }
  } catch (err: any) {
    Logs({
      node: ["voice", "thread", "delete"],
      state: "error",
      content: err,
      details: channel.id,
    });
  }
};
