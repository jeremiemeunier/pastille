const { Events } = require('discord.js');
const { logs } = require('../function/logs');
const { createVoiceThread, joinVoiceThread, leaveVoiceThread, deleteVoiceThread } = require('../function/voice');
const { getParams } = require('../function/base');

const countMembers = async (channel, guild) => {
  try {
    const connected = channel.members.map(x => x).length;
    return connected;
  }
  catch(error) { logs("error", "voice:count_members", error, guild.id); }
}

const getTextualChannel = async (channel, guild) => {
  const guildParams = await getParams(guild);
  const { channels } = guildParams.options;

  try {
    if(channel.parentId !== null) {
      const textual = guild.channels.cache.find(
        textual => textual.name === channels.voiceText && textual.parentId === channel.parentId
      );
  
      if(textual === undefined) {
        const textualGlobal = guild.channels.cache.find(
          textual => textual.name === channels.voiceText && textual.parentId === null
        );

        return textualGlobal;
      }

      return textual;
    }
    else {
      const textual = guild.channels.cache.find(
        textual => textual.name === channels.voiceText && textual.parentId === null
      );
  
      return textual;
    }
  }
  catch(error) { logs("error", "voice:search_textual", error, guild.id); }
}

const voiceEventInit = (client) => {
  client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
    if(newState.channelId === oldState.channelId) { return; }

    const guild = client.guilds.cache.find(guild => guild.id === oldState.guild.id) ||
                  client.guilds.cache.find(guild => guild.id === newState.guild.id);
    try {
      const user = oldState.member.user.id || newState.member.user.id;

      if (newState.channelId === null) {
        const voiceChannel = guild.channels.cache.find(voiceChannel => voiceChannel.id === oldState.channelId);
        const connected = await countMembers(voiceChannel, guild);
        const textual = await getTextualChannel(voiceChannel, guild);

        if(connected === 0) { deleteVoiceThread(voiceChannel, textual); }
        else { leaveVoiceThread(voiceChannel, textual, user); }
      }
      else if (oldState.channelId === null) {
        const voiceChannel = guild.channels.cache.find(voiceChannel => voiceChannel.id === newState.channelId);
        const connected = await countMembers(voiceChannel, guild);
        const textual = await getTextualChannel(voiceChannel, guild);

        if(connected === 1) {  createVoiceThread(voiceChannel, textual, user); }
        else { joinVoiceThread(voiceChannel, textual, user); }
      }
      else {
        const oldVoiceChannel = guild.channels.cache.find(oldVoiceChannel => oldVoiceChannel.id === oldState.channelId);
        const newVoiceChannel = guild.channels.cache.find(newVoiceChannel => newVoiceChannel.id === newState.channelId);
        const oldConnected = await countMembers(oldVoiceChannel, guild);
        const newConnected = await countMembers(newVoiceChannel, guild);
        const oldTextual = await getTextualChannel(oldVoiceChannel, guild);
        const newTextual = await getTextualChannel(newVoiceChannel, guild);

        if(oldConnected === 0) { deleteVoiceThread(oldVoiceChannel, oldTextual); }
        else { leaveVoiceThread(oldVoiceChannel, oldTextual, user); }
        if(newConnected === 1) { createVoiceThread(newVoiceChannel, newTextual, user); }
        else { joinVoiceThread(newVoiceChannel, newTextual, user); }
      }
    }
    catch(error) { logs('error', 'voice', error); return; }
  });
}

module.exports = { voiceEventInit }