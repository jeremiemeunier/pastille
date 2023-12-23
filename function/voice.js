const { ChannelType, EmbedBuilder } = require('discord.js');
const { logs } = require('../function/logs');
const { options } = require('../config/settings.json');

const createVoiceThread = async (channel, threadChannel, user) => {
  try {
    const thread = await threadChannel.threads.create({
      name: `Voice : ${channel.name}`,
      autoArchiveDuration: 4320,
      reason: `Dedicated text channel for the voice channel ${channel.name}`,
      type: ChannelType.PrivateThread,
      invitable: false
    });
    await thread.members.add(user);
    const embed = new EmbedBuilder()
      .setColor(options.color)
      .setDescription(`<@${user}> tu as rejoint un salon vocal 🎙️`);
    const message = await thread.send({ embeds: [embed, embedExplicative] });
  }
  catch(error) { logs("error", "voice:thread:create", error); }
}

const joinVoiceThread = async (channel, threadChannel, user) => {
  try {
    const thread = threadChannel.threads.cache.find(thread => thread.name === `Voice : ${channel.name}`);
    await thread.members.add(user);
    const embed = new EmbedBuilder()
      .setColor(options.color)
      .setDescription(`<@${user}> a rejoint le salon vocal 🎙️`);
    const message = await thread.send({ embeds: [embed] });
  }
  catch(error) { logs("error", "voice:thread:join", error); }
}

const leaveVoiceThread = async (channel, threadChannel, user) => {
  try {
    const thread = threadChannel.threads.cache.find(thread => thread.name === `Voice : ${channel.name}`);
    await thread.members.remove(user);
    const embed = new EmbedBuilder()
      .setColor(options.color)
      .setDescription(`<@${user}> a quitté ce salon vocal 💨`);
    const message = await thread.send({ embeds: [embed] });
  }
  catch(error) { logs("error", "voice:thread:leave", error); }
}

const deleteVoiceThread = async (channel, threadChannel) => {
  try {
    const thread = threadChannel.threads.cache.find(thread => thread.name === `Voice : ${channel.name}`);
    const embed = new EmbedBuilder()
      .setColor(options.color)
      .setDescription(`Il n'y a plus personne dans ce channel, il va être supprimé dans quelques secondes.`);
    const message = await thread.send({ embeds: [embed] });
    
    setTimeout(async () => {
      try { await thread.delete(); }
      catch(error) { logs("error", "voice:thread:delete:timeout", error); }
    }, 5000);
  }
  catch(error) { logs("error", "voice:thread:delete", error); }
}

const embedExplicative = new EmbedBuilder()
  .setColor(options.color)
  .setTitle('Ce salon est dédié à votre channel vocal actuel.')
  .setDescription(`- Il sera automatiquement supprimé une fois que tout le monde aura quitter le channel.\r\n- Chaque personne qui rejoint est automatiquement ajoutée au fil.\r\n- Chaque personne qui quitte le channel vocal est retirée du fil automatiquement.\r\n- Tu peux définir le status de ton salon vocal avec la commande **!status** directement depuis ce fil\r\n- L'automodération est toujours présente même ici. Tu doit donc respecter les règles du serveur.\r\n- Pour un rappel des règles tu peux faire **!regles** directement depuis ce fil`);

module.exports = { createVoiceThread, joinVoiceThread, leaveVoiceThread, deleteVoiceThread }