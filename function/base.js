const dateParser = (today) => {
    let dateReturn = '';

	if(today == undefined) { today = new Date(); }
	if(today.getHours() < 10) { dateReturn += `0${today.getHours()}:`; } else { dateReturn += `${today.getHours()}:`; }
	if(today.getMinutes() < 10) { dateReturn += `0${today.getMinutes()}:`; } else { dateReturn += `${today.getMinutes()}:`; }
	if(today.getSeconds() < 10) { dateReturn += `0${today.getSeconds()}`; } else { dateReturn += `${today.getSeconds()}`; }

	return dateReturn;
}

const logger = (tag, channel, content) => {

    channel.send({ content: '```' + tag + content + '```' });
}

module.exports = { dateParser, logger }