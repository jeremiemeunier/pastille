const fs = require('fs');
let secret_settings = JSON.parse(fs.readFileSync('data/secret.json'));
let config_settings = JSON.parse(fs.readFileSync('data/config.json'));
let secretSettings = JSON.parse(fs.readFileSync('data/secret.json'));
let globalSettings = JSON.parse(fs.readFileSync('data/config.json'));
let alphabetLetters = JSON.parse(fs.readFileSync('data/alphabet.json'));

const { ChannelType, Client, Events, EmbedBuilder, GatewayIntentBits, Partials, ShardingManager } = require('discord.js');
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildVoiceStates],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

const { createThreadOnJoin, joinThreadOnJoin, leaveThreadOnLeave, deleteThreadOnLeave } = require('./events/voice.js');

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

client.on('voiceStateUpdate', async (oldState, newState) => {
    if (newState.channelId === null) {
        const guild = client.guilds.cache.find(guild => guild.id === oldState.guild.id);
        const channel = guild.channels.cache.find(channel => channel.id === oldState.channelId);
        const text = guild.channels.cache.find(text => text.name === 'voix-avec-les-mains');

        let nbConnected = channel.members.map(x => x).length;

        if(nbConnected === 0) { deleteThreadOnLeave(channel, text); }
        else { leaveThreadOnLeave(channel, text, oldState.member.user.id); }
    }
    else if (oldState.channelId === null) {
        const guild = client.guilds.cache.find(guild => guild.id === newState.guild.id);
        const channel = guild.channels.cache.find(channel => channel.id === newState.channelId);
        const text = guild.channels.cache.find(text => text.name === 'voix-avec-les-mains');

        let nbConnected = channel.members.map(x => x).length;

        if(nbConnected === 1) {  createThreadOnJoin(channel, text, oldState.member.user.id); }
        else { joinThreadOnJoin(channel, text, newState.member.user.id); }
    }
    else {
        if(newState.channelId === oldState.channelId) { return; }
		else {
			const guild = client.guilds.cache.find(guild => guild.id === oldState.guild.id);
			const oldChannel = guild.channels.cache.find(oldChannel => oldChannel.id === oldState.channelId);
			const newChannel = guild.channels.cache.find(newChannel => newChannel.id === newState.channelId);
			const text = guild.channels.cache.find(text => text.name === 'voix-avec-les-mains');

			let oldNbConnected = oldChannel.members.map(x => x).length;
			let newNbConnected = newChannel.members.map(x => x).length;

			if(oldNbConnected === 0) { deleteThreadOnLeave(oldChannel, text); }
			else { leaveThreadOnLeave(oldChannel, text, oldState.member.user.id); }

			if(newNbConnected === 1) { createThreadOnJoin(newChannel, text, newState.member.user.id); }
			else { joinThreadOnJoin(newChannel, text, newState.member.user.id); }
		}
    }
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return;
	const { commandName } = interaction;

	if(commandName === 'staff') {
		const embed = new EmbedBuilder()
							.setColor('#20A68E')
							.setDescription(`Pour contacter le staff cliquer sur 📨`);
		const message = await interaction.reply({ embeds: [embed], fetchReply: true });
		message.react('📨');
	}
	else if(commandName === 'modos') {
		const embed = new EmbedBuilder()
							.setColor('#20A68E')
							.setDescription(`Faire une réclamation sur une décision de modération, clique sur 🤕`);
		const message = await interaction.reply({ embeds: [embed], fetchReply: true });
		message.react('🤕');
	}
	else if(commandName === 'rule') {
		const rules = new EmbedBuilder()
							.setColor('#20A68E')
							.setTitle('Règles du serveur')
							.setDescription(`Les règles du serveur sont simples.\r\nEn utilisant ce serveur discord, l'utilisateur accepte d'emblée le réglement.`)
							.addFields(
								{ name: "🤜 Spams, menaces", value: "Pas de spam, de doxxing/menaces ou d'insultes", inline: false },
								{ name: "📺 Torrent", value: "Pas de choses illégales (torrent de film/musique, jeux craqué)", inline: false },
								{ name: "📖 Channel, topics", value: "Respectez les channels, topics, etc", inline: false },
								{ name: "💗 Respect", value: "Traitez tout le monde avec respect. Aucun harcèlement, chasse aux sorcières, sexisme, racisme ou discours de haine ne sera toléré.", inline: false },
								{ name: "📣 Pubs", value: "Pas de spam ni d'autopromotion (invitations de serveurs, publicités, etc.) sans l'autorisation d'un modérateur du serveur, y compris via les MP envoyés aux autres membres. Le salon <#882582553222082580> est prévu pour ça.", inline: false },
								{ name: "🔞 NSFW", value: "**Ce serveur est tout public !** Pas de contenu violent, obscène ou NSFW, qu'il s'agisse de texte, d'images ou de liens mettant en scène de la nudité, du sexe, de l'hyperviolence ou un quelconque contenu dérangeant.", inline: false },
								{ name: "\u200B", value: "Si tu remarques quelque chose de contraire aux règles ou qui te met dans un sentiment d'insécurité, informes en les modérateurs. Nous voulons que ce serveur soit accueillant pour tout le monde !", inline: false }
							);
		const modos = new EmbedBuilder()
							.setColor('#20A68E')
							.setTitle('Modérations')
							.setDescription(`Les décisions des modérateur et de l'équipe du serveur ne sont pas discutable. Si tu pense qu'elle est injuste, utilise le ticket dans <#1049836337131434016>.`)
							.addFields(
								{ name: "Modération", value: "<@&882582552550965262>", inline: true },
								{ name: "\u200B", value: "<@&1049094503157485708>", inline: true }
							);
		const embed = new EmbedBuilder()
							.setColor('#20A68E')
							.setDescription(`Pour accepter les règles et accéder au serveur clique sur 👍`);
		const message = await interaction.reply({ embeds: [rules, modos, embed], fetchReply: true });
		message.react('👍');
	}
	else if(commandName === 'poll') {
		let pollChoices = '';

		for(let i = 0;i<22;i++) {
			if(interaction.options.getString(`choice_${alphabetLetters[i].letter}`) === null) {
				const embed = new EmbedBuilder()
							.setColor('#20A68E')
							.setTitle(interaction.options.getString('question'))
							.setDescription(pollChoices);
							const message = await interaction.reply({ embeds: [embed], fetchReply: true, content: "Nouveau sondage !" });
				for(let j = 0;j < i;j++) {
					let first = interaction.options.getString(`choice_${alphabetLetters[j].letter}`).split(' ')[0];
					let letter = alphabetLetters[j].emoji;

					try { await message.react(first); }
					catch(error) {
						try { await message.react(letter); }
						catch(error) { return; }
					}
				}
				break;
			}
			else {
				pollChoices = pollChoices + `\r\n${interaction.options.getString(`choice_${alphabetLetters[i].letter}`)}`;
			}
		}
	}
});

client.on(Events.MessageReactionAdd, async (reaction, user) => {
    if(reaction.emoji.name === '📨' && user.username !== 'pastille_bot') {
        const helpZone = client.channels.cache.find(channel => channel.name === globalSettings.channels.help);
        if (reaction.partial) {
            try { await reaction.fetch(); }
            catch (error) {
                console.error('Something went wrong when fetching the message:', error);
                return;
            }
        }

        reaction.users.remove(user);
        const thread = await helpZone.threads.create({
            name: `@${user.username} request help`,
            autoArchiveDuration: 60,
            reason: `Requested help form @${user.username}`,
            type: ChannelType.PrivateThread,
        });
        await thread.members.add(user);
        let embed = new EmbedBuilder()
                                .setColor('#20A68E')
                                .setTitle(`Requested help from @${user.username}`)
                                .setDescription(`Pour mettre fin à ta demande d'aide clique sur 🔒`);
        const message = await thread.send({ embeds: [embed] });
        message.react('🔒');
    }
    else if(reaction.emoji.name === '🤕' && user.username !== 'pastille_bot') {
        const helpZone = client.channels.cache.find(channel => channel.name === globalSettings.channels.reclamation);
        if (reaction.partial) {
            try { await reaction.fetch(); }
            catch (error) {
                console.error('Something went wrong when fetching the message:', error);
                return;
            }
        }

        reaction.users.remove(user);
        const thread = await helpZone.threads.create({
            name: `@${user.username} have reclamation`,
            autoArchiveDuration: 60,
            reason: `Reclamation from @${user.username}`,
            type: ChannelType.PrivateThread,
        });
        await thread.members.add(user);
        let embed = new EmbedBuilder()
                                .setColor('#20A68E')
                                .setTitle(`Reclamation from @${user.username}`)
                                .setDescription(`Pour mettre fin à ta demande clique sur 🔒`);
        const message = await thread.send({ embeds: [embed] });
        message.react('🔒');
    }
    else {
        if(reaction.emoji.name === '🔒' && user.username !== 'pastille_bot') {
            let channel = client.channels.cache.find(channel => channel.name === globalSettings.channels.help);
            let thread = channel.threads.cache.find(thread => thread.id === reaction.message.channelId);

            if(thread === undefined) {
                channel = client.channels.cache.find(channel => channel.name === globalSettings.channels.reclamation);
                thread = channel.threads.cache.find(thread => thread.id === reaction.message.channelId);
            }

            thread.setLocked(true);

            let embed = new EmbedBuilder()
                                .setColor('#20A68E')
                                .addFields(
                                    { name: "Archivage", value: 'Clique sur 📦 pour archiver ce fil.', inline: true },
                                    { name: "Déverouillage", value: 'Clique sur 🔓 pour débloquer ce fil.', inline: true })
                                .setDescription(`Ce fil est maintenant verrouillé.`);
            const message = await thread.send({ embeds: [embed]});
            message.react('📦');
            message.react('🔓');
        }
        else if(reaction.emoji.name === '📦' && user.username !== 'pastille_bot') {
            let channel = client.channels.cache.find(channel => channel.name === globalSettings.channels.help);
            let thread = channel.threads.cache.find(thread => thread.id === reaction.message.channelId);

            if(thread === undefined) {
                channel = client.channels.cache.find(channel => channel.name === globalSettings.channels.reclamation);
                thread = channel.threads.cache.find(thread => thread.id === reaction.message.channelId);
            }

            thread.setArchived(true);
        }
        else if(reaction.emoji.name === '🔓' && user.username !== 'pastille_bot') {
            let channel = client.channels.cache.find(channel => channel.name === globalSettings.channels.help);
            let thread = channel.threads.cache.find(thread => thread.id === reaction.message.channelId);

            if(thread === undefined) {
                channel = client.channels.cache.find(channel => channel.name === globalSettings.channels.reclamation);
                thread = channel.threads.cache.find(thread => thread.id === reaction.message.channelId);
            }

            thread.setLocked(false);
            let embed = new EmbedBuilder()
                                .setColor('#20A68E')
                                .setDescription(`Ce fil est de nouveau disponible. Pour mettre fin à ta demande clique sur 🔒`);
            const message = await thread.send({ embeds: [embed] });
            message.react('🔒');
        }
    }
});

client.on(Events.MessageCreate, async (message) => {
    const content = message.content;
    const guild = client.guilds.cache.find(guild => guild.id === message.guildId);
    const channel = guild.channels.cache.find(channel => channel.id === message.channelId);

    const msg = channel.messages.cache.find(message => message.id === message.id);
    let splitedMsg = content.split(' ');
    let cmd = splitedMsg.shift().slice(1);
    let text = splitedMsg.join(' ');

    if(message.author.bot === true) { return; }
    if(content.startsWith(globalSettings.options.bang)) {
        if(cmd === 'announce') {
            message.delete();
            const embed = new EmbedBuilder()
                                    .setColor('#20A68E')
                                    .setDescription(text);
            channel.send({ content: '📢 **Annonce !** ||@everyone||', embeds: [embed] });
        }
        else if(cmd === 'regles' || cmd === 'regle' || cmd === 'rule' || cmd === 'rules') {
            message.delete();
            if(text === 'spams') {
                const embed = new EmbedBuilder()
                                        .setColor('#20A68E')
                                        .setTitle('🤜 Spams, menaces')
                                        .setDescription(`Pas de spam, de doxxing/menaces ou d'insultes`);
                const send = await channel.send({ content: 'Un rappel ne fait pas de mal ! Allez lire les <#882582553071079485>', embeds: [embed] });
                send.react('👮‍♂️');
            }
            else if(text === 'torrent') {
                const embed = new EmbedBuilder()
                                        .setColor('#20A68E')
                                        .setTitle('📺 Torrent')
                                        .setDescription(`Pas de choses illégales (torrent de film/musique, jeux craqué)`);
                const send = await channel.send({ content: 'Un rappel ne fait pas de mal ! Allez lire les <#882582553071079485>', embeds: [embed] });
                send.react('👮‍♂️');
            }
            else if(text === 'channel') {
                const embed = new EmbedBuilder()
                                        .setColor('#20A68E')
                                        .setTitle('📖 Channel, topics')
                                        .setDescription(`Respectez les channels, topics, etc`);
                const send = await channel.send({ content: 'Un rappel ne fait pas de mal ! Allez lire les <#882582553071079485>', embeds: [embed] });
                send.react('👮‍♂️');
            }
            else if(text === 'respect') {
                const embed = new EmbedBuilder()
                                        .setColor('#20A68E')
                                        .setTitle('💗 Respect')
                                        .setDescription(`Traitez tout le monde avec respect. Aucun harcèlement, chasse aux sorcières, sexisme, racisme ou discours de haine ne sera toléré.`);
                const send = await channel.send({ content: 'Un rappel ne fait pas de mal ! Allez lire les <#882582553071079485>', embeds: [embed] });
                send.react('👮‍♂️');
            }
            else if(text === 'pubs') {
                const embed = new EmbedBuilder()
                                        .setColor('#20A68E')
                                        .setTitle('📣 Pubs')
                                        .setDescription(`Pas de spam ni d'autopromotion (invitations de serveurs, publicités, etc.) sans l'autorisation d'un modérateur du serveur, y compris via les MP envoyés aux autres membres. Le salon <#1049836337131434016> est prévu pour ça.`);
                const send = await channel.send({ content: 'Un rappel ne fait pas de mal ! Allez lire les <#882582553071079485>', embeds: [embed] });
                send.react('👮‍♂️');
            }
            else if(text === 'nsfw') {
                const embed = new EmbedBuilder()
                                        .setColor('#20A68E')
                                        .setTitle('🔞 NSFW')
                                        .setDescription(`**Ce serveur est tout public !** Pas de contenu violent, obscène ou NSFW, qu'il s'agisse de texte, d'images ou de liens mettant en scène de la nudité, du sexe, de l'hyperviolence ou un quelconque contenu dérangeant.`);
                const send = await channel.send({ content: 'Un rappel ne fait pas de mal ! Allez lire les <#882582553071079485>', embeds: [embed] });
                send.react('👮‍♂️');
            }
            else {
                const send = await channel.send({ content: 'Un rappel ne fait pas de mal ! Allez lire les <#882582553071079485>' });
                send.react('👮‍♂️');
            }
        }
    }
    else { return; }
});

client.on('ready', () => { fc_booter(); });
client.login(secret_settings.BOT_TOKEN);
