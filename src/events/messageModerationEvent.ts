import { automodRegister } from "@functions/automod/automodRegister";
import { getParams } from "@functions/base";
import Logs from "@libs/Logs";
import { Events, EmbedBuilder } from "discord.js";

export const automod = (client: any) => {
  client.on(
    Events.MessageCreate,
    async (message: {
      guildId: any;
      mentions: {
        roles: {
          map: (arg0: (x: any) => any) => { (): any; new (): any; length: any };
        };
        users: {
          map: (arg0: (x: any) => any) => { (): any; new (): any; length: any };
        };
        everyone: boolean;
      };
      author: { id: any; bot: boolean; system: boolean };
      channelId: any;
      content: string;
      delete: () => void;
    }) => {
      const guild = client.guilds.cache.find(
        (guild: { id: any }) => guild.id === message.guildId
      );

      const guildParams = await getParams({ guild: guild });
      const { options, moderation } = guildParams;
      const { limit } = moderation;

      const mentions =
        message.mentions.roles.map((x: any) => x).length +
        message.mentions.users.map((x: any) => x).length;
      const user = guild.members.cache.find(
        (user: { id: any }) => user.id === message.author.id
      );
      const infractionChannel = guild.channels.cache.find(
        (channel: { id: any }) => channel.id === message.channelId
      );
      const automod = guild.channels.cache.find(
        (channel: { id: any }) => channel.id === moderation.channels.automod
      );

      const regexDiscordInvitation = new RegExp(/https:\/\/discord.gg/gm);

      if (user === undefined) {
        return;
      }

      try {
        if (
          isImune(user, moderation.imune) ||
          message.author.bot === true ||
          message.author.system === true
        ) {
          return;
        }

        if (mentions > limit.mention && mentions > 0 && limit.mention > -1) {
          try {
            const embedProof = new EmbedBuilder({
              color: parseInt(options.color, 16),
              description: message.content,
            });
            const embedSanction = new EmbedBuilder({
              color: parseInt(options.color, 16),
              title: `${user.user.username} [${user.user.globalName}] a reçu un avertissement`,
              description: "**Raison** : Trop de mentions",
            });
            message.delete();

            await automod.send({
              embeds: [embedSanction, embedProof],
            });
            await infractionChannel.send({
              content: `<@${user.user.id.toString()}> you receive a warn`,
              embeds: [embedSanction],
            });
            await user.send({
              content: `<@${user.user.id.toString()}> you receive a warn`,
              embeds: [embedSanction],
            });
            automodRegister(user, "limitMention", guild);
          } catch (error: any) {
            Logs("automod:mention", "error", error);
          }
          return;
        }

        if (message.mentions.everyone === true) {
          try {
            const embedProof = new EmbedBuilder({
              color: parseInt(options.color, 16),
              description: message.content,
            });
            const embedSanction = new EmbedBuilder({
              color: parseInt(options.color, 16),
              title: `${user.user.username} [${user.user.globalName}] a reçu un avertissement`,
              description: "**Raison** : Mentionne @everyone",
            });
            message.delete();
            await automod.send({ embeds: [embedSanction, embedProof] });
            await infractionChannel.send({
              content: `<@${user.user.id.toString()}> receive a warn`,
              embeds: [embedSanction],
            });
            await user.send({
              content: `<@${user.user.id.toString()}> you receive a warn`,
              embeds: [embedSanction],
            });
            automodRegister(user, "mentionEveryone", guild);
          } catch (error: any) {
            Logs("automod:everyone", "error", error);
          }
          return;
        }

        if (
          regexDiscordInvitation.test(message.content) &&
          limit.invite === 1
        ) {
          try {
            const embedProof = new EmbedBuilder({
              color: parseInt(options.color, 16),
              description: message.content,
            });
            const embedSanction = new EmbedBuilder({
              color: parseInt(options.color, 16),
              title: `${user.user.username} [${user.user.globalName}] a reçu un avertissement`,
              description: "**Raison** : Envoie d'une invitation de serveur",
            });

            message.delete();
            await automod.send({ embeds: [embedSanction, embedProof] });
            await infractionChannel.send({
              content: `<@${user.user.id.toString()}> receive a warn`,
              embeds: [embedSanction],
            });
            await user.send({
              content: `<@${user.user.id.toString()}> you receive a warn`,
              embeds: [embedSanction],
            });
            automodRegister(user, "sendInvite", guild);
          } catch (error: any) {
            Logs("automod:send_invite", "error", error);
          }
          return;
        }
      } catch (error: any) {
        Logs("automod", "error", error);
      }
    }
  );
};

export const isImune = (
  user: { roles: { cache: any } },
  imune: string | any[]
) => {
  const userRoles = user.roles.cache;
  let imunised = [];

  if (imune) {
    userRoles.map((role: { id: any }) => {
      if (imune.indexOf(role.id) !== -1) {
        imunised.push(role.id);
      }
    });
  }

  if (imunised.length > 0) {
    return true;
  }
  return false;
};
