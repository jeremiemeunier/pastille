const { ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, EmbedBuilder, GatewayIntentBits, ActivityType } = require('discord.js');
const fs = require('fs');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const config_settings = JSON.parse(fs.readFileSync('data/config.json'));
const secret_settings = JSON.parse(fs.readFileSync('data/secret.json'));

// Base function for optimal working

function fc_dateReturn(ajd) {
	let ret = '';

	if(ajd == undefined) { ajd = new Date(); }

	if(ajd.getHours() < 10) { ret += `0${ajd.getHours()}:`; } else { ret += `${ajd.getHours()}:`; }
	if(ajd.getMinutes() < 10) { ret += `0${ajd.getMinutes()}:`; } else { ret += `${ajd.getMinutes()}:`; }
	if(ajd.getSeconds() < 10) { ret += `0${ajd.getSeconds()}`; } else { ret += `${ajd.getSeconds()}`; }

	return ret;
}

function fc_clock() {
	var deadline = new Date(2023, 2, 16, 8, 0);
	var actual = new Date();
	var timing;

	function fc_clock_diff_day(d1,d2){
		var WNbJours = d2.getTime() - d1.getTime();
		return Math.ceil(WNbJours/(1000*60*60*24));
	}

	function fc_clock_diff_hours(d1,d2){
		var WNbJours = d2.getTime() - d1.getTime();
		return Math.ceil(WNbJours/(1000*60*60));
	}

	if(fc_clock_diff_day(deadline, actual).toString() === '-1') {
		timing = `H${fc_clock_diff_hours(deadline, actual)}`;
	}
	else {
		timing = `J${fc_clock_diff_day(deadline, actual)}`;
	}

	

	client.user.setPresence({ activities: [{ name: `Haltero.app ${timing.toString()}`, type: ActivityType.Competing }] });
}

function fc_booter() {
	let server = client.guilds.cache.get(secret_settings.GUILD_ID);
	let announce = client.channels.cache.find(channel => channel.name === config_settings.channel.announce);
	let debug = client.channels.cache.find(channel => channel.name === config_settings.channel.debug);
	let every = server.roles.cache.find(role => role.name === '@everyone');

	let bootEmbed = new EmbedBuilder()
                            .setColor('#5865f2')
                            .setDescription(`TIMER`)
                            .addFields(
                                { name: 'Date starting', value: fc_dateReturn(new Date()), inline: true },
                                { name: 'Debug', value: config_settings.debug.toString(), inline: true },
                                { name: 'Version', value: config_settings.version.toString(), inline: true }
                            )
                            .setTimestamp()
                            .setFooter({ text: `Version ${config_settings.version}`, });
	debug.send({ embeds: [bootEmbed] });

	setInterval(function() {
		fc_clock({"announce":announce,"debug":debug,"every":every});
	}, 1000);
}

client.on('ready', () => { fc_booter(); });
client.login(secret_settings.BOT_TOKEN);