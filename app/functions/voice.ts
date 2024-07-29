import { ChannelType, EmbedBuilder } from "discord.js";
import { getParams } from "./base";
import logs from "./logs";

/**
 * Create a new thread on first join on voice channel
 *
 * @param {*} guild Discord guild item
 * @param {*} channel Discord channel item
 * @param {*} threadChannel Discord thread channel item
 * @param {*} user Discord user item
 */
export const createVoiceThread = async (
  guild: any,
  channel: any,
  threadChannel: any,
  user: any
) => {
  const guildParams = await getParams(guild);
  const { options } = guildParams;

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
    const message = await thread.send({ embeds: [embed, embedExplicative] });
  } catch (error: any) {
    logs("error", "voice:thread:create", error);
  }
};

/**
 * Add user to thread on join voice channel
 *
 * @param {*} guild Discord guild item
 * @param {*} channel Discord channel item
 * @param {*} threadChannel Discord thread channel item
 * @param {*} user Discord user item
 */
export const joinVoiceThread = async (
  guild: any,
  channel: any,
  threadChannel: any,
  user: any
) => {
  try {
    const thread = threadChannel.threads.cache.find(
      (thread: any) => thread.name === `Voice : ${channel.name}`
    );
    await thread.members.add(user);
    const embed = new EmbedBuilder({
      color: 32768,
      description: `<@${user}> tu as rejoint le salon vocal 🎙️`,
    });
    const message = await thread.send({ embeds: [embed] });
  } catch (error: any) {
    logs("error", "voice:thread:join", error);
  }
};

/**
 * Remove user to thread on join voice channel
 *
 * @param {*} guild Discord guild item
 * @param {*} channel Discord channel item
 * @param {*} threadChannel Discord thread channel item
 * @param {*} user Discord user item
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
    logs("error", "voice:thread:leave", error);
  }
};

/**
 * Deleting thread on last user leave voice channel
 *
 * @param {*} guild Discord guild item
 * @param {*} channel Discord channel item
 * @param {*} threadChannel Discord thread channel item
 */
export const deleteVoiceThread = async (
  guild: any,
  channel: any,
  threadChannel: any
) => {
  const guildParams = await getParams(guild);
  const { options } = guildParams;

  try {
    const thread = threadChannel.threads.cache.find(
      (thread: any) => thread.name === `Voice : ${channel.name}`
    );
    const embed = new EmbedBuilder({
      color: parseInt(options.color, 16),
      description:
        "Il n'y a plus personne dans ce channel, il va être supprimé dans quelques secondes.",
    });
    const message = await thread.send({ embeds: [embed] });

    try {
      await thread.delete();
    } catch (error: any) {
      logs("error", "voice:thread:delete:timeout", error);
    }
  } catch (error: any) {
    logs("error", "voice:thread:delete", error);
  }
};
