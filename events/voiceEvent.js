const { Events } = require('discord.js');
const { logs } = require('../function/logs');
const { createVoiceThread, joinVoiceThread, leaveVoiceThread, deleteVoiceThread } = require('../function/voice');
const { channels } = require ('../config/settings.json');

const voiceEventInit = (client) => {
    client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
        if(newState.channelId === oldState.channelId) { return; }
        else {
            const guild = client.guilds.cache.find(guild => guild.id === oldState.guild.id) ||
                          client.guilds.cache.find(guild => guild.id === newState.guild.id);
            let textChannel = guild.channels.cache.find(textChannel => textChannel.name === channels.voiceText);
            try {
                const user = oldState.member.user.id || newState.member.user.id;
    
                if (newState.channelId === null) {
                    const voiceChannel = guild.channels.cache.find(voiceChannel => voiceChannel.id === oldState.channelId);
                    const connected = voiceChannel.members.map(x => x).length;
    
                    if(voiceChannel.parentId !== null) {
                        textChannel = guild.channels.cache.find(
                            textChannel => textChannel.name === channels.voiceText
                            && textChannel.parentId === voiceChannel.parentId);
                    }
    
                    if(connected === 0) { deleteVoiceThread(voiceChannel, textChannel); }
                    else { leaveVoiceThread(voiceChannel, textChannel, user); }
                }
                else if (oldState.channelId === null) {
                    const voiceChannel = guild.channels.cache.find(voiceChannel => voiceChannel.id === newState.channelId);
                    const connected = voiceChannel.members.map(x => x).length;
    
                    if(voiceChannel.parentId !== null) {
                        textChannel = guild.channels.cache.find(
                            textChannel => textChannel.name === channels.voiceText
                            && textChannel.parentId === voiceChannel.parentId);
                    }
            
                    if(connected === 1) {  createVoiceThread(voiceChannel, textChannel, user); }
                    else { joinVoiceThread(voiceChannel, textChannel, user); }
                }
                else {
                    const oldVoiceChannel = guild.channels.cache.find(oldVoiceChannel => oldVoiceChannel.id === oldState.channelId);
                    const newVoiceChannel = guild.channels.cache.find(newVoiceChannel => newVoiceChannel.id === newState.channelId);
                    const oldNbConnected = oldVoiceChannel.members.map(x => x).length;
                    const newNbConnected = newVoiceChannel.members.map(x => x).length;
                    let oldTextChannel = textChannel;
                    let newTextChannel = textChannel;
    
                    if(oldVoiceChannel.parentId !== null) {
                        oldTextChannel = guild.channels.cache.find(
                            oldTextChannel => oldTextChannel.name === channels.voiceText
                            && oldTextChannel.parentId === oldVoiceChannel.parentId);
                    }
                    if(newVoiceChannel.parentId !== null) {
                        newTextChannel = guild.channels.cache.find(
                            newTextChannel => newTextChannel.name === channels.voiceText
                            && newTextChannel.parentId === newVoiceChannel.parentId);
                    }
            
                    if(oldNbConnected === 0) { deleteVoiceThread(oldVoiceChannel, oldTextChannel); }
                    else { leaveVoiceThread(oldVoiceChannel, oldTextChannel, user); }
                    if(newNbConnected === 1) { createVoiceThread(newVoiceChannel, newTextChannel, user); }
                    else { joinVoiceThread(newVoiceChannel, newTextChannel, user); }
                }
            }
            catch(error) { logs('error', 'voice', error); return; }
        }
    });
}

module.exports = { voiceEventInit }