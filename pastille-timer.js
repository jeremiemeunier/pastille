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

	
	var TempsRestant = deadline.getTime() - actual.getTime();
	var HeuresRestant = Math.floor(TempsRestant/(1000*60*60));
	var MinRestant = Math.floor(TempsRestant/(1000*60)) - (HeuresRestant*60);

	if(MinRestant.toString().length == 1) {
		MinRestant = `0${MinRestant}`;
	}

	if(TempsRestant > 0) {
		client.user.setPresence({ activities: [{ name: `H-${HeuresRestant.toString()}:${MinRestant.toString()}`, type: ActivityType.Competing }] });
	}
	else {
		client.user.setPresence({ activities: [{ name: `lancement Haltero.app`, type: ActivityType.Competing }] });
	}
}

function fc_booter() {
	let server = client.guilds.cache.get(secret_settings.GUILD_ID);
	let announce = client.channels.cache.find(channel => channel.name === config_settings.channel.announce);
	let debug = client.channels.cache.find(channel => channel.name === config_settings.channel.debug);
	let every = server.roles.cache.find(role => role.name === '@everyone');

	let bootEmbed = new EmbedBuilder()
                            .setColor('#277CCB')
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
	}, 30000);
}

client.on('ready', () => { fc_booter(); });
client.login(secret_settings.BOT_TOKEN);