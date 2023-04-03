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

const fc_clock = (channels) => {
	let deadline = new Date(2023, 8, 1, 8, 30);
	let actual = new Date();
	let textActivities;
	
	let TempsRestant = deadline.getTime() - actual.getTime();
	let dayToPass = Math.floor((deadline.getTime() - actual.getTime()) / ((60*60*1000)*24));
	let HeuresRestant = Math.floor(TempsRestant/(1000*60*60));
	let MinRestant = Math.floor(TempsRestant/(1000*60)) - (HeuresRestant*60);

	if(dayToPass > 2) {
		textActivities = `J-${dayToPass.toString()}`;
		client.user.setPresence({ activities: [{ name: textActivities.toString(), type: ActivityType.Playing }] });
	}
	else {
		if(MinRestant.toString().length == 1) {
			MinRestant = `0${MinRestant}`;
		}
		if(TempsRestant > 0) {
			client.user.setPresence({ activities: [{ name: `H-${HeuresRestant.toString()}:${MinRestant.toString()}`, type: ActivityType.Playing }] });
		}
		else {
			client.user.setPresence({ activities: [{ name: `lancement DigitalTeaCompany`, type: ActivityType.Playing }] });
		}
	}

}

function fc_booter() {
	let announce = client.channels.cache.find(channel => channel.name === config_settings.channel.announce);
	let debug = client.channels.cache.find(channel => channel.name === config_settings.channel.debug);

	let bootEmbed = new EmbedBuilder()
                            .setColor('#20A68E')
							.setAuthor({ name: `TIMER`, iconURL: 'https://1.images.cdn.pooks.fr/github/pastillebot/pastille_avatar.png' })
                            .addFields(
                                { name: 'Date starting', value: fc_dateReturn(new Date()), inline: true },
                                { name: 'Debug', value: config_settings.debug.toString(), inline: true },
                                { name: 'Version', value: config_settings.version.toString(), inline: true }
                            )
                            .setTimestamp()
                            .setFooter({ text: `Version ${config_settings.version}`, });
	debug.send({ embeds: [bootEmbed] });

	setInterval(function() {
		fc_clock({"announce":announce,"debug":debug});
	}, 60000);

	fc_clock({"announce":announce,"debug":debug});
}

client.on('ready', () => { fc_booter(); });
client.login(secret_settings.BOT_TOKEN);