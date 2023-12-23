const { BOT_ID } = require("../config/secret.json");
const axios = require("axios");
const { logs } = require("../function/logs");

const getAddons = async (guild) => {
	const guildId = guild.id;

	try {
		const guildAddonsRequest = await axios({
			method: "get",
			url: "/addons",
			params: {
				guild: guildId
			},
			headers: {
				"pastille_botid": BOT_ID
			}
		});

		const guildAddons = guildAddonsRequest.data.data;
		return guildAddons;
	}
	catch(error) { logs("error", "global:get:guild_addons", error, guild.id); }
}

const getRoles = async (guild) => {
	const guildId = guild.id;

	try {
		const guildRolesrequest = await axios({
			method: "get",
			url: "/roles",
			params: {
				guild: guildId
			},
			headers: {
				"pastille_botid": BOT_ID
			}
		});

		const guildRoles = guildRolesrequest.data.data;
		return guildRoles;
	}
	catch(error) { logs("error", "global:get:guild_rules", error, guild.id); }
}

const getRules = async (guild) => {
	const guildId = guild.id;

	try {
		const guildRulesRequest = await axios({
			method: "get",
			url: "/rules",
			params: {
				guild: guildId
			},
			headers: {
				"pastille_botid": BOT_ID
			}
		});

		const guildRules = guildRulesRequest.data.data;
		return guildRules;
	}
	catch(error) { logs("error", "global:get:guild_rules", error, guild.id); }
}

const getCommands = async (guild, id) => {
	const guildId = guild.id;

	if(id) {
    try {
      const guildCommandsRequest = await axios({
        method: "get",
        url: "/commands/id",
        params: {
          id: id
        },
        headers: {
          "pastille_botid": BOT_ID
        }
      });
  
      const guildCommands = guildCommandsRequest.data.data;
      return guildCommands;
    }
    catch(error) { logs("error", "global:get:guild_commands:id", error, guild.id); }
  }
  else {
    try {
      const guildCommandsRequest = await axios({
        method: "get",
        url: "/commands",
        params: {
          guild_id: guildId
        },
        headers: {
          "pastille_botid": BOT_ID
        }
      });
  
      const guildCommands = guildCommandsRequest.data.data;
      return guildCommands;
    }
    catch(error) { logs("error", "global:get:guild_commands", error, guild.id); }
  }
}

const getParams = async (guild) => {
	const guildId = guild.id;

	try {
		const guildParamsRequest = await axios({
			method: "get",
			url: "/settings",
			params: {
				guild_id: guildId
			},
			headers: {
				"pastille_botid": BOT_ID
			}
		});

		const guildParams = guildParamsRequest.data.data;
		return guildParams;
	}
	catch(error) { logs("error", "global:get:guild_params", error, guild.id); }
}

const hoursParser = async (date) => {
  if(date === undefined) { date = new Date(); }

  const hours = date.getHours() < 10 ? `0${date.getHours() < 10}` : date.getHours();
  const minutes = date.getMinutes() < 10 ? `0${date.getMinutes() < 10}` : date.getMinutes();
  const seconds = date.getSeconds() < 10 ? `0${date.getSeconds() < 10}` : date.getSeconds();

	return `${hours}:${minutes}:${seconds}`;
}

const dateParser = async (date) => {
  if(date === undefined) { date = new Date(); }

  const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
  const month = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth();
  const year = date.getFullYear();

	return `${day}/${month}/${year}`;
}

module.exports = { hoursParser, dateParser, getParams, getAddons, getRules, getRoles, getCommands }