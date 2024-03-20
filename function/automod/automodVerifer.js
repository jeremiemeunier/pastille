import { EmbedBuilder } from "discord.js";
import { logs } from "../logs";
import axios from "axios";
import { getParams } from "../base";

export const durationFormater = (time) => {
  const duration = time / 1000;
  const days = Math.floor(duration / (24 * 3600));

  const calcHours = (days, duration) => {
    const response = Math.floor((duration - days * (24 * 3600)) / 3600);
    return response;
  };

  const calcMinutes = (days, hours, duration) => {
    const response = Math.floor(
      (duration - days * (24 * 3600) - hours * 3600) / 60
    );
    return response;
  };

  const hours = calcHours(days, duration);
  const minutes = calcMinutes(days, hours, duration);

  if (days > 0) {
    return `${days} jour(s)`;
  }
  if (hours > 0) {
    return `${hours} heure(s)`;
  }
  if (minutes > 0) {
    return `${minutes} minute(s)`;
  }
};

export const automodFinalNotify = async (guild, user) => {
  const guildParams = await getParams(guild);
  const { options } = guildParams;

  const embedSanction = new EmbedBuilder({
    color: parseInt(options.color, 16),
    title: "Banissement définitif du serveur",
    description: `Tu as été banni de manière définitive du serveur suite à de multiple infraction aux règle de ce serveur : **__${guild.name}__**`,
  });

  try {
    await user.send({
      content: `Tu es banni(e) définitivement de **__${guild.name}__**`,
      embeds: [embedSanction],
    });
  } catch (error) {
    logs("error", "automod:remove", error, guild.id);
  }
};

export const automodRemove = async (guild, user) => {
  const guildParams = await getParams(guild);
  const { moderation } = guildParams;

  const sanctionRole = guild.roles.cache.find(
    (role) => role.id === moderation.roles.muted
  );
  const embedSanction = new EmbedBuilder({
    color: 32768,
    title: "Sanction terminée",
    description: `Ta sanction sur **__${guild.name}__** vient de prendre fin. Tu peux à nouveau profiter pleinement du serveur.`,
  });

  try {
    await user.roles.remove(sanctionRole);
    await user.send({
      content: `Ta sanction sur **__${guild.name}__** vient de prend fin`,
      embeds: [embedSanction],
    });
  } catch (error) {
    logs("error", "automod:remove", error, guild.id);
  }
};

export const automodApply = async (guild, user, timer) => {
  const guildParams = await getParams(guild);
  const { moderation } = guildParams;

  const alertChannel = guild.channels.cache.find(
    (channel) => channel.id === moderation.channels.alert
  );
  const textualDuration = durationFormater(timer);
  const sanctionRole = guild.roles.cache.find(
    (role) => role.id === moderation.roles.muted
  );
  const embedSanction = new EmbedBuilder({
    color: 16711680,
    title: "Nouvelle sanction",
    description: `Tu es timeout pour ${textualDuration}.\r\n**Tu ne peux plus :**\r\n- Envoyer de message\r\n- Parler dans les channels vocaux\r\n- Réagir aux posts des autres membres\r\n- Participer ou rejoindre de nouveaux fils.\r\n\r\n 
    **Ces interdictions sont valables jusqu'à la fin de ta sanction.**`,
  });
  const embedDecision = new EmbedBuilder({
    color: 16711680,
    title: "Nouvelle sanction",
    description: `Nouvelle sanction contre **__${user.globalName}__** pour ${textualDuration}`,
  });

  try {
    await user.send({
      content: `<@${user.id.toString()}> tu as été sanctionné(e) sur **__${guild.name}__**`,
      embeds: [embedSanction],
    });
    await user.roles.add(sanctionRole);
    await alertChannel.send({ embeds: [embedDecision] });
  } catch (error) {
    logs("error", "automod:sanction:notice", error, guild.id);
  }

  const applySanction = setTimeout(async () => {
    automodRemove(guild, user);
  }, timer);
};

/**
 * Check if user must be banned or relaxed
 *
 * @param {*} guild A discord guild item
 */
export const automodVerifier = async (guild) => {
  const now = Date.parse(new Date());

  logs("infos", "automod:verifier", "Start sanctions verifications", guild.id);

  try {
    const allGuildSanctionsRequest = await axios.get("/sanction", {
      params: { guild_id: guild.id },
      headers: { pastille_botid: process.env.BOT_ID },
    });

    const allGuildSanctions = allGuildSanctionsRequest.data.data;
    const guildParams = await getParams(guild);
    const { moderation } = guildParams;

    if (allGuildSanctions && allGuildSanctions.length > 0) {
      try {
        allGuildSanctions.map(async (item) => {
          const { sanction, user_id, _id } = item;
          const ending = Date.parse(new Date(sanction.ending));
          const userFetch = async () => {
            try {
              return await guild.members.fetch(user_id);
            } catch (error) {
              logs("error", "automode:verifier:fetch_user", error, guild.id);
            }
          };
          const user = await userFetch();
          const sanctionRole = guild.roles.cache.find(
            (role) => role.id === moderation.roles.muted
          );

          if (!user) {
            try {
              await axios.put(
                "/sanction/update",
                {},
                {
                  params: { id: _id },
                  headers: { pastille_botid: process.env.BOT_ID },
                }
              );
            } catch (error) {
              logs("error", "automod:rebind:update", error, guild.id);
            }
            logs(
              "warning",
              "automod:verifier:rebind",
              `User not find : ${user_id}`,
              guild.id
            );
            return;
          }
          if (!sanctionRole) {
            logs(
              "warning",
              "automod:verifier:rebind",
              `Role not find : ${moderation.roles.muted}`,
              guild.id
            );
            return;
          }

          if (ending <= now) {
            try {
              await user.roles.remove(sanctionRole);
            } catch (error) {
              logs("error", "sanction:verifier:remove", error, guild.id);
            }
          } else {
            const newTimer = ending - now;

            try {
              const sanctionApply = setTimeout(async () => {
                automodRemove(guild, user);
              }, newTimer);
            } catch (error) {
              logs("error", "sanction:verifier:remove:timer", error, guild.id);
            }
          }
        });
      } catch (error) {
        logs("error", "automod:verifier", error, guild.id);
      }
    }
  } catch (error) {
    logs("error", "automod:verifier", error);
  }

  logs("infos", "automod:verifier", "End sanctions verifications", guild.id);
};
