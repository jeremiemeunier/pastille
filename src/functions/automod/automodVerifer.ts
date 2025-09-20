import { EmbedBuilder } from "discord.js";
import { getParams } from "../base";
import pastilleAxios from "@libs/PastilleAxios";
import { SanctionTypes } from "@/types/Sanction.types";
import Logs from "@libs/Logs";

export const durationFormater = (time: any) => {
  const duration = time / 1000;
  const days = Math.floor(duration / (24 * 3600));

  const calcHours = (days: any, duration: any) => {
    const response = Math.floor((duration - days * (24 * 3600)) / 3600);
    return response;
  };

  const calcMinutes = (days: any, hours: any, duration: any) => {
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

export const automodFinalNotify = async (guild: any, user: any) => {
  const guildParams = await getParams({ guild: guild });
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
  } catch (err: any) {
    Logs("automod:remove", "error", err, guild?.id);
  }
};

export const automodRemove = async (guild: any, user: any) => {
  const guildParams = await getParams({ guild: guild });
  const { moderation } = guildParams;

  const sanctionRole = guild.roles.cache.find(
    (role: any) => role.id === moderation.roles.muted
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
  } catch (err: any) {
    Logs("automod:remove", "error", err, guild?.id);
  }
};

export const automodApply = async (guild: any, user: any, timer: any) => {
  const guildParams = await getParams({ guild: guild });
  const { moderation } = guildParams;

  const alertChannel = guild.channels.cache.find(
    (channel: any) => channel.id === moderation.channels.alert
  );
  const textualDuration = durationFormater(timer);
  const sanctionRole = guild.roles.cache.find(
    (role: any) => role.id === moderation.roles.muted
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
      content: `<@${user.id.toString()}> tu as été sanctionné(e) sur **__${
        guild.name
      }__**`,
      embeds: [embedSanction],
    });
    await user.roles.add(sanctionRole);
    await alertChannel.send({ embeds: [embedDecision] });
  } catch (err: any) {
    Logs("automod:sanction:notice", "error", err, guild?.id);
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
export const automodVerifier = async (guild: any) => {
  const now = Date.parse(new Date().toString());

  Logs("automod:verifier", null, "start sanctions verifications", guild?.id);

  try {
    const allGuildSanctionsRequest = await pastilleAxios.get("/sanction", {
      params: { guild_id: guild?.id },
      headers: { pastille_botid: process.env.BOT_ID },
    });

    const allGuildSanctions = allGuildSanctionsRequest.data.data;
    const guildParams = await getParams({ guild: guild });
    const { moderation } = guildParams;

    if (allGuildSanctions && allGuildSanctions.length > 0) {
      try {
        allGuildSanctions.map(async (item: SanctionTypes) => {
          const { sanction, user_id, _id } = item;
          const ending = Date.parse(new Date(sanction.ending).toString());
          const userFetch = async () => {
            try {
              return await guild.members.fetch(user_id);
            } catch (err: any) {
              Logs("automode:verifier:fetch_user", "error", err, guild?.id);
            }
          };
          const user = await userFetch();
          const sanctionRole = guild.roles.cache.find(
            (role: any) => role.id === moderation.roles.muted
          );

          if (!user) {
            try {
              await pastilleAxios.put(
                "/sanction/update",
                {},
                {
                  params: { id: _id },
                  headers: { pastille_botid: process.env.BOT_ID },
                }
              );
            } catch (err: any) {
              Logs("automod:rebind:update", "error", err, guild?.id);
            }
            Logs(
              "automod:verifier:rebind",
              "warning",
              `user not find : ${user_id}`,
              guild?.id
            );
            return;
          }
          if (!sanctionRole) {
            Logs(
              "automod:verifier:rebind",
              "warning",
              `role not find : ${moderation.roles.muted}`,
              guild?.id
            );
            return;
          }

          if (ending <= now) {
            try {
              await user.roles.remove(sanctionRole);
            } catch (err: any) {
              Logs("sanction:verifier:remove", "error", err, guild?.id);
            }
          } else {
            const newTimer = ending - now;

            try {
              const sanctionApply = setTimeout(async () => {
                automodRemove(guild, user);
              }, newTimer);
            } catch (err: any) {
              Logs("sanction:verifier:remove:timer", "error", err, guild?.id);
            }
          }
        });
      } catch (err: any) {
        Logs("automod:verifier", "error", err, guild?.id);
      }
    }
  } catch (err: any) {
    Logs("automod:verifier", "error", err);
  }

  Logs("automod:verifier", null, "end sanctions verifications", guild?.id);
};
