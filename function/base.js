const axios = require("axios");
const { logs } = require("../function/logs");
const { BOT_ID } = require("../config/secret.json");

const getAddons = async (guild) => {
	try {
		const guildAddonsRequest = await axios.get("/addons", {
      params: { guild_id: guild.id },
      headers: { "pastille_botid": BOT_ID }});
		const guildAddons = guildAddonsRequest.data.data;
		return guildAddons;
	}
	catch(error) { logs("error", "global:get:guild_addons", error, guild.id); }
}

const getBanWord = async (guild) => {
  try {
    const guildBanWordsRequest = await axios.get("/banwords", {
      params: { guild_id: guild.id },
      headers: { "pastille_botid": BOT_ID }});
    const guildBanWords = guildBanWordsRequest.data.data;
    return guildBanWords;
  }
  catch(error) { logs("error", "global:get:guild_ban_word", error, guild.id); }
}

const getStreamers = async (guild) => {
  try {
    const guildStreamersRequest = await axios.get("/twitch", {
      params: { guild_id: guild.id },
      headers: { "pastille_botid": BOT_ID }});
    const guildStreamersList = guildStreamersRequest.data.data;

    return guildStreamersList;
  }
  catch(error) { logs("error", "global:get:streamer_list", error, guild.id); }
}

const getRoles = async (guild) => {
	try {
		const guildRolesrequest = await axios.get("/roles", {
      params: { guild_id: guild.id },
      headers: { "pastille_botid": BOT_ID }});
		const guildRoles = guildRolesrequest.data.data;
		return guildRoles;
	}
	catch(error) { logs("error", "global:get:guild_rules", error, guild.id); }
}

const getRules = async (guild) => {
	try {
		const guildRulesRequest = await axios.get("/rules", {
      params: { guild_id: guild.id },
      headers: { "pastille_botid": BOT_ID }});
		const guildRules = guildRulesRequest.data.data;
		return guildRules;
	}
	catch(error) { logs("error", "global:get:guild_rules", error, guild.id); }
}

const getLetters = async (letter, limit = -1) => {
  if(letter) {
    try {
      const appLetterRequest = await axios.get("/emotes", {
        params: { letter: letter, },
        headers: { "pastille_botid": BOT_ID }});
      const appLetter = appLetterRequest.data.data;
      return appLetter;
    }
    catch(error) { logs("error", "global:get:letter", error); }
  }
  else {
    try {
      const appLettersRequest = await axios.get("/emotes/all", {
        params: { limit: limit },
        headers: { "pastille_botid": BOT_ID }});
      const appLetters = appLettersRequest.data.data;
      return appLetters;
    }
    catch(error) { logs("error", "global:get:letters", error); }
  }
}

const getCommands = async (guild, id) => {
	if(id) {
    try {
      const guildCommandsRequest = await axios.get("/commands/id", {
        params: { id: id },
        headers: { "pastille_botid": BOT_ID }});
      const guildCommands = guildCommandsRequest.data.data;
      return guildCommands;
    }
    catch(error) { logs("error", "global:get:guild_commands:id", error, guild.id); }
  }
  else {
    try {
      const guildCommandsRequest = await axios.get("/commands", {
        params: { guild_id: guild.id },
        headers: { "pastille_botid": BOT_ID }});
      const guildCommands = guildCommandsRequest.data.data;
      return guildCommands;
    }
    catch(error) { logs("error", "global:get:guild_commands", error, guild.id); }
  }
}

const getParams = async (guild) => {
	try {
		const guildParamsRequest = await axios.get("/settings", {
      params: { guild_id: guild.id },
      headers: { "pastille_botid": BOT_ID }});
		const guildParams = guildParamsRequest.data.data;
		return guildParams;
	}
	catch(error) { logs("error", "global:get:guild_params", error, guild.id); }
}

const postWarnUser = async (guild, data) => {
  try {
    const warnUserRequest = axios.post("/infraction", {
      user_id: data.user_id,
      reason: data.reason,
      date: new Date(),
      guild_id: guild.id
    }, { headers: { "pastille_botid": BOT_ID }});

    return warnUserRequest.data.data;
  }
  catch(error) { logs("error", "global:post:infraction", error, guild.id); }
}

const hoursParser = async (date) => {
  if(date === undefined) { date = new Date(); }

  const hours = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours();
  const minutes = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
  const seconds = date.getSeconds() < 10 ? `0${date.getSeconds()}` : date.getSeconds();

	return `${hours}:${minutes}:${seconds}`;
}

const dateParser = async (date) => {
  if(date === undefined) { date = new Date(); }

  const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
  const month = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth();
  const year = date.getFullYear();

	return `${day}/${month}/${year}`;
}

module.exports = {
  hoursParser, dateParser, getParams, getAddons, getRules, getRoles, getCommands, getLetters, getBanWord, getStreamers, postWarnUser }