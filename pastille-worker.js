const fs = require('fs');
let secret_settings = JSON.parse(fs.readFileSync('data/secret.json'));
let config_settings = JSON.parse(fs.readFileSync('data/config.json'));

const { ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, EmbedBuilder, GatewayIntentBits, SelectMenuBuilder } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

function fc_dateReturn(ajd) {
	let ret = '';

	if(ajd == undefined) { ajd = new Date(); }

	if(ajd.getHours() < 10) { ret += `0${ajd.getHours()}:`; } else { ret += `${ajd.getHours()}:`; }
	if(ajd.getMinutes() < 10) { ret += `0${ajd.getMinutes()}:`; } else { ret += `${ajd.getMinutes()}:`; }
	if(ajd.getSeconds() < 10) { ret += `0${ajd.getSeconds()}`; } else { ret += `${ajd.getSeconds()}`; }

	return ret;
}
function fc_logger(txt, timed = true) {
	let logs_tag = `\x1b[34mpastille_bot[\x1b[0m${config_settings.app_name.worker}\x1b[34m][\x1b[0m${config_settings.version}\x1b[34m]`;
  let logs_txt_tag = `pastille_bot[${config_settings.app_name.worker}][${config_settings.version}]`;

	if(timed == true) { logs_tag += ` ${dateReturn()} \x1b[0m `; } else { logs_tag += `\x1b[0m `; }

	console.log(`${logs_tag}${txt}`);
	let ajd = new Date();

	if(ajd.getDate() < 10) { ajdDate = `0${ajd.getDate()}`; } else { ajdDate = ajd.getDate(); }
	if(Number(ajd.getMonth() + 1) < 10) { ajdMonth = `0${Number(ajd.getMonth())+1}`; } else { ajdMonth = Number(ajd.getMonth())+1; }

	let ajd_compose = `${ajdMonth}-${ajdDate}-${ajd.getFullYear()}`;
	fs.writeFile(`logs/${config_settings.app_name.worker}-${ajd_compose}.log`, `${logs_txt_tag}${txt}\r\n`, { flag: 'a' }, err => {
		if(err) {
			console.log(err);
			return;
		}
	});
}
function fc_startlog() {
  fc_logger(`as \x1b[34m${client.user.tag}\x1b[0m`, false);
  fc_logger(`\x1b[43m\x1b[30m START VAR SETTINGS \x1b[0m `, false);
  fc_logger(`\x1b[43m\x1b[30m END VAR SETTINGS \x1b[0m `, false);
  fc_logger(`is initialized at \x1b[34m${fc_dateReturn(new Date())}\x1b[0m`, false);
	fc_logger(`\x1b[42m\x1b[30m ${config_settings.app_name.worker} [${config_settings.version}] INITIALIZED \x1b[0m `, false);
}
function fc_booter() {
	let debug = client.channels.cache.find(channel => channel.name === config_settings.channel.debug);
	let bootEmbed = new EmbedBuilder()
                            .setColor('#5865f2')
                            .setDescription(`${config_settings.app_name.worker}`)
                            .addFields(
                              { name: 'Date starting', value: fc_dateReturn(new Date()), inline: true },
                              { name: 'Debug', value: config_settings.debug.toString(), inline: true },
                              { name: 'Version', value: config_settings.version.toString(), inline: true }
                            )
                            .setTimestamp()
                            .setFooter({ text: `Version ${config_settings.version}`, });
	debug.send({ embeds: [bootEmbed] });
  fc_startlog();
}

client.on('interactionCreate', async interaction => {
  if (!interaction.isSelectMenu()) return;

  if(interaction.customId === 'role_select') {
    await interaction.update({ content: `Tu as choisi un rôle :clap: ! Je vais t'ajouter le rôle <@&${interaction.values[0]}>`, components: [] });
        interaction.member.roles.add(`${interaction.values[0]}`);
  }
  else if(interaction.customId === 'notif_select') {
    await interaction.update({ content: `Tu as choisis une notification :bell: ! Je vais t'ajouter le rôle <@&${interaction.values[0]}> pour que tu ai toutes les notifs !`, components: [] });
        interaction.member.roles.add(`${interaction.values[0]}`);
  }

  let logs = client.channels.cache.find(channel => channel.name === config_settings.channel.logs);
      logs.send({ content: `J'ai ajouter le rôle <@&${interaction.values[0]}> au membre ${interaction.member}` });
});

client.on('interactionCreate', async interaction => {
  //if (!interaction.isReaction()) return;
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'role') {
    const select = new ActionRowBuilder()
			.addComponents(
				new SelectMenuBuilder()
					.setCustomId('role_select')
					.setPlaceholder('Aucun rôle sélectionné')
					.addOptions(
						{
							label: 'Amateur de frisbee',
							description: 'Rejoins nous pour jouer ou partager tes jeux',
							value: '882582552550965261',
						},
						{
							label: 'Minecraft',
							description: 'Si tu aime les blocs',
							value: '882582552550965260',
						},
						{
							label: 'Boss d\'internet',
							description: 'Deviens le plus malin de BichonWood et vient parler code',
							value: '882582552538390550',
						},
						{
							label: 'La 3ème dimension',
							description: 'Montre tout tes talents en modélisation 3D',
							value: '909759890107547658',
						},
					),
			);

		await interaction.reply({ content: `Pour t'ajouter un rôle, choisis dans la liste ci-dessous :`, components: [select], fetchReply: true });
  }
  else if (interaction.commandName === 'notifs') {
    const select = new ActionRowBuilder()
			.addComponents(
				new SelectMenuBuilder()
					.setCustomId('notif_select')
					.setPlaceholder('Aucunes notifications sélectionné')
					.addOptions(
						{
							label: 'Notifs mod twitch',
							description: 'Reçois les notifs de tout les streams de mes streamers favoris',
							value: '882582552538390549',
						},
						{
							label: 'Bichon en live',
							description: 'Reçois ton alerte dès que je suis en live',
							value: '997269081185075270',
						},
					),
			);

		await interaction.reply({ content: `Pour t'ajouter un rôle, choisis dans la liste ci-dessous :`, components: [select], fetchReply: true });
  }
  else if(interaction.commandName === 'poll') {
    let questionValue = `${interaction.guild.emojis.cache.find(emoji => emoji.name === config_settings.emoji.poll)} **${interaction.options.getString("question")}**`;
    let responseOptions = interaction.options.getString("response").split(';');
    let responseLenght = Object.keys(responseOptions).length;
    let aswerText = "";

    for(let i = 0; i < responseLenght; i++) {
      let responseText = responseOptions[i];
      if(i === 0) { aswerText += `1️⃣  ${responseText}\r\n`; }
      else if(i === 1) { aswerText += `2️⃣  ${responseText}\r\n`; }
      else if(i === 2) { aswerText += `3️⃣  ${responseText}\r\n`; }
      else if(i === 3) { aswerText += `4️⃣  ${responseText}\r\n`; }
      else if(i === 4) { aswerText += `5️⃣  ${responseText}\r\n`; }
    }

    const pollEmbed = new EmbedBuilder()
                            .setColor("060D25")
                            .setDescription(aswerText);
    const message = await interaction.reply({ content: questionValue, embeds: [pollEmbed], fetchReply: true });

    for(var i = 0; i < responseLenght; i++) {
      if(i === 0) { message.react('1️⃣'); }
      else if(i === 1) { message.react('2️⃣'); }
      else if(i === 2) { message.react('3️⃣'); }
      else if(i === 3) { message.react('4️⃣'); }
      else if(i === 4) { message.react('5️⃣'); }
    }
  }
});

client.on('ready', () => { fc_booter(); });
client.login(secret_settings.BOT_TOKEN);
