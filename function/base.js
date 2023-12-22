const { BOT_ID } = require("../config/secret.json");
const axios = require("axios");

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
	catch(error) { logs("error", "globa:get_guild_params", error); }
}

const dateParser = (today) => {
    let dateReturn = '';

	if(today == undefined) { today = new Date(); }
	if(today.getHours() < 10) { dateReturn += `0${today.getHours()}:`; } else { dateReturn += `${today.getHours()}:`; }
	if(today.getMinutes() < 10) { dateReturn += `0${today.getMinutes()}:`; } else { dateReturn += `${today.getMinutes()}:`; }
	if(today.getSeconds() < 10) { dateReturn += `0${today.getSeconds()}`; } else { dateReturn += `${today.getSeconds()}`; }

	return dateReturn;
}

module.exports = { dateParser, getParams }