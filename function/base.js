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
	catch(error) { logs("error", "global:get:guild_addons", error); }
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
	catch(error) { logs("error", "global:get:guild_rules", error); }
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
	catch(error) { logs("error", "global:get:guild_rules", error); }
}

const getParams = async (guild) => {
	const guildId = guild.id;

	try {
		const guildParamsRequest = await axios({
			method: "get",
			url: "/params",
			params: {
				guild: guildId
			},
			headers: {
				"pastille_botid": BOT_ID
			}
		});

		const guildParams = guildParamsRequest.data.data;
		return guildParams;
	}
	catch(error) { logs("error", "global:get:guild_params", error); }
}

const dateParser = (today) => {
    let dateReturn = '';

	if(today == undefined) { today = new Date(); }
	if(today.getHours() < 10) { dateReturn += `0${today.getHours()}:`; } else { dateReturn += `${today.getHours()}:`; }
	if(today.getMinutes() < 10) { dateReturn += `0${today.getMinutes()}:`; } else { dateReturn += `${today.getMinutes()}:`; }
	if(today.getSeconds() < 10) { dateReturn += `0${today.getSeconds()}`; } else { dateReturn += `${today.getSeconds()}`; }

	return dateReturn;
}

module.exports = { dateParser, getParams, getAddons, getRules, getRoles }