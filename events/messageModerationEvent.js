const { Events, EmbedBuilder } = require('discord.js');
const { logsEmiter } = require('../function/logs');
const { channels, options, moderation } = require ('../config/settings.json');
const { automodRegister } = require('../function/automod/automodRegister');

let client;

const automod = (clientItem) => {
    client = clientItem;

    client.on(Events.MessageCreate, async (message) => {
        const guild = client.guilds.cache.find(guild => guild.id === message.guildId);
        const mentions = message.mentions.roles.map(x => x).length + message.mentions.users.map(x => x).length;
        const user = guild.members.cache.find(user => user.id === message.author.id);
        const channel = guild.channels.cache.find(channel => channel.id === message.channelId);
        const alert = guild.channels.cache.find(alert => alert.id === moderation.channels.alert);

        if(user === undefined) { return; }

		try {
            if (isImune(user) ||
                message.author.bot === true ||
                message.author.system === true) { return; }

            if(mentions > moderation.limit.mention && mentions > 0) {
                try {
					const embedProof = new EmbedBuilder()
											.setColor(options.color)
											.setDescription(message.content);
					const embedSanction = new EmbedBuilder()
                                            .setColor(options.color)
                                            .setTitle(`${user.user.username} [${user.user.globalName}] a reçu un avertissement`)
                                            .setDescription('**Raison** : Trop de mentions');
					message.delete();
					await alert.send({
                        embeds: [embedSanction, embedProof] });
					await channel.send({
                        content: `<@${user.user.id.toString()}> you receive a warn`,
                        embeds: [embedSanction] });
					await user.send({
                        content: `<@${user.user.id.toString()}> you receive a warn`,
                        embeds: [embedSanction] });
                    automodRegister(user, 'limitMention', guild);
				}
				catch(error) { logsEmiter(`An error occured [automod:mention]\r\n${error}`); }
                return;
            }
            else if(message.mentions.everyone === true) {
				try {
					const embedProof = new EmbedBuilder()
											.setColor(options.color)
											.setDescription(message.content);
					const embedSanction = new EmbedBuilder()
												.setColor(options.color)
												.setTitle(`${user.user.username} [${user.user.globalName}] a reçu un avertissement`)
												.setDescription('**Raison** : Mentionne @everyone');
					message.delete();
					await alert.send({
                        embeds: [embedSanction, embedProof] });
					await channel.send({
                        content: `<@${user.user.id.toString()}> you receive a warn`,
                        embeds: [embedSanction] });
					await user.send({
                        content: `<@${user.user.id.toString()}> you receive a warn`,
                        embeds: [embedSanction] });
                    automodRegister(user, 'mentionEveryone', guild);
				}
				catch(error) { logsEmiter(`An error occured [automod:everyone]\r\n${error}`); }
                return;
			}
        }
        catch(error) { logsEmiter(`An error occured [automod] : \r\n ${error}`); }
    });
}

const isImune = (user) => {
    moderation.imune.map(imune => {
        if(user.roles.cache.has(imune)) { return true; }
    });
}

module.exports = { automod }