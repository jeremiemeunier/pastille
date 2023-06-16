const fs = require('fs');
const globalSettings = JSON.parse(fs.readFileSync('config/settings.json'));
const tag = `pastille_bot[${globalSettings.version}] `;

const dateParser = (today) => {
    let dateReturn = '';

	if(today == undefined) { today = new Date(); }
	if(today.getHours() < 10) { dateReturn += `0${today.getHours()}:`; } else { dateReturn += `${today.getHours()}:`; }
	if(today.getMinutes() < 10) { dateReturn += `0${today.getMinutes()}:`; } else { dateReturn += `${today.getMinutes()}:`; }
	if(today.getSeconds() < 10) { dateReturn += `0${today.getSeconds()}`; } else { dateReturn += `${today.getSeconds()}`; }

	return dateReturn;
}

const logger = (channel, message) => {
    try {
		channel.send({ content: '```' + tag + message + '```' });
		console.log(`${tag} ${message}`);
	}
	catch(error) { console.log(error); }
}

module.exports = { dateParser, logger }