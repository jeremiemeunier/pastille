import {
  ChannelType,
  EmbedBuilder,
  Guild,
  GuildMember,
  TextChannel,
  VoiceChannel,
} from "discord.js";
import { getParams } from "./base";
import Logs from "@libs/Logs";

export const haveVoiceThread = async ({
  channel,
  threadChannel,
}: {
  channel: VoiceChannel;
  threadChannel: TextChannel;
}) => {
  try {
    const thread = threadChannel.threads.cache.find(
      (thread: any) => thread.name === `Voice : ${channel.name}`
    );

    if (thread) {
      return true;
    }

    return false;
  } catch (error: any) {
    Logs("voice:thread:join", "error", error);
  }
};

/**
 * Create a new thread on first join on voice channel
 */
export const createVoiceThread = async (
  guild: any,
  channel: any,
  threadChannel: any,
  user: any
) => {
  const guildParams = await getParams({ guild: guild });
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
          color: parseInt(options.color, 16),
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
      } catch (error: any) {
        Logs("voice:thread:create", "error", error);
      }
    }
  } catch (error: any) {
    Logs("voice:thread:find:existing", "error", error);
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
  } catch (error: any) {
    Logs("voice:thread:join", "error", error);
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
        if (member.id !== user) {
          try {
            await thread.members.add(member);
            const embed = new EmbedBuilder({
              color: 32768,
              description: `${member} tu as été ajouté à ce fils dédié 🎙️`,
            });
            await thread.send({ embeds: [embed] });
          } catch (error: any) {
            Logs("voice:thread:join:all", "error", error);
          }
        }
      });
    }
  } catch (error: any) {
    Logs("voice:thread:join", "error", error);
  }
};

/**
 * Remove user to thread on join voice channel
 */

export const leaveVoiceThread = async (
  guild: any,
  channel: any,
  threadChannel: any,
  user: any
) => {
  try {
    const thread = threadChannel.threads.cache.find(
      (thread: any) => thread.name === `Voice : ${channel.name}`
    );
    await thread.members.remove(user);
    const embed = new EmbedBuilder({
      color: 16711680,
      description: `<@${user}> a quitté ce salon vocal 💨`,
    });
    const message = await thread.send({ embeds: [embed] });
  } catch (error: any) {
    Logs("voice:thread:leave", "error", error);
  }
};

/**
 * Deleting thread on last user leave voice channel
 */
export const deleteVoiceThread = async (
  guild: any,
  channel: any,
  threadChannel: any
) => {
  const guildParams = await getParams({ guild: guild });
  const { options } = guildParams;

  try {
    const thread = threadChannel.threads.cache.find(
      (thread: any) => thread.name === `Voice : ${channel.name}`
    );
    try {
      await thread.delete();
    } catch (error: any) {
      Logs("voice:thread:delete:timeout", "error", error);
    }
  } catch (error: any) {
    Logs("voice:thread:delete", "error", error);
  }
};
