import Logs from "@libs/Logs";
import pastilleAxios from "@libs/PastilleAxios";
import { Guild } from "discord.js";

/**
 * Return a json object with addons registred for this guild
 *
 * @param {object} guild Discord guild item
 * @returns {boolean|object} false on err | A json object with all registred addons for guild on success
 */
export const getAddons = async ({ guild }: { guild: Guild }) => {
  try {
    return (
      await pastilleAxios.get("/addons", {
        params: { guild_id: guild.id },
      })
    ).data;
  } catch (err: any) {
    if (err.status === 404) return false;
    Logs(["addon", "load", "guild"], "error", err, guild.id);
    return false;
  }
};

/**
 * Return a json object with banned words registred for this guild
 *
 * @param {object} guild Discord guild item
 * @returns {boolean|object} false on err | A json object with all registred banned word for guild on success
 */
export const getBanWord = async ({ guild }: { guild: Guild }) => {
  try {
    return (
      await pastilleAxios.get("/banwords", {
        params: { guild_id: guild },
        headers: { pastille_botid: process.env.BOT_ID },
      })
    ).data;
  } catch (err: any) {
    if (err.status === 404) return false;
    Logs(["automod", "load", "banword"], "error", err, guild.id);
    return false;
  }
};

/**
 * Return a json object with streamer registred for this guild
 *
 * @param {object} guild Discord guild item
 * @returns {boolean|object} false on err | A json object with all registred streamer for guild on success
 */
export const getStreamers = async ({ guild }: { guild: Guild }) => {
  try {
    return (
      await pastilleAxios.get("/twitch", {
        params: { guild_id: guild.id },
        headers: { pastille_botid: process.env.BOT_ID },
      })
    ).data;
  } catch (err: any) {
    Logs(["global", "get", "streamer_list"], "error", err, guild.id);
    return false;
  }
};

/**
 * Return a json object with roles registred for this guild
 *
 * @param {object} guild Discord guild item
 * @returns {boolean|object} false on err | A json object with all registred roles for guild on success
 */
export const getRoles = async ({ guild }: { guild: Guild }) => {
  try {
    return (
      await pastilleAxios.get("/roles", {
        params: { guild_id: guild.id },
        headers: { pastille_botid: process.env.BOT_ID },
      })
    ).data;
  } catch (err: any) {
    if (err.status === 404) return false;
    Logs(["roles", "load", "guild"], "error", err, guild.id);
    return false;
  }
};

/**
 * Return a json object with rules registred for this guild
 *
 * @param {object} guild Discord guild item
 * @returns {boolean|object} false on err | A json object with all registred rules for guild on success
 */
export const getRules = async ({ guild }: { guild: Guild }) => {
  try {
    return (
      await pastilleAxios.get("/rules", {
        params: { guild_id: guild.id },
        headers: { pastille_botid: process.env.BOT_ID },
      })
    ).data;
  } catch (err: any) {
    Logs(["rules", "load", "guild"], "error", err, guild.id);
    return false;
  }
};

export const getCommands = async ({
  guild,
  id,
}: {
  guild: Guild;
  id?: any;
}) => {
  if (id) {
    try {
      return (
        await pastilleAxios.get("/commands/id", {
          params: { id: id },
        })
      ).data;
    } catch (err: any) {
      Logs(["cmd", "load", "guild"], "error", err, guild.id);
      return false;
    }
  } else {
    try {
      return (
        await pastilleAxios.get("/commands", {
          params: { guild_id: guild.id },
          headers: { pastille_botid: process.env.BOT_ID },
        })
      ).data;
    } catch (err: any) {
      Logs(["cmds", "load", "guild"], "error", err, guild.id);
      return false;
    }
  }
};

/**
 * Return a json object with settings registred for this guild
 *
 * @param {object} guild Discord guild item
 * @returns {boolean|object} false on err | A json object with settings for guild on success
 */
export const getParams = async ({ guild }: { guild: Guild }) => {
  try {
    return (
      await pastilleAxios.get("/settings", {
        params: { guild_id: guild.id },
        headers: { pastille_botid: process.env.BOT_ID },
      })
    ).data;
  } catch (err: any) {
    Logs(["params", "load", "guild"], "error", err, guild.id);
    return false;
  }
};

/**
 * Add a warn on user for reason pass in parameters
 *
 * @param {object} guild Discord guild item
 * @param {object} data A json object with user_id and reason
 * @returns {boolean|object} false on err | A json object with new registred warn for user on success
 */
export const postWarnUser = async ({
  guild,
  data,
}: {
  guild: Guild;
  data: any;
}) => {
  try {
    return (
      await pastilleAxios.post(
        "/infraction",
        {
          user_id: data.user_id,
          reason: data.reason,
          date: new Date(),
          guild_id: guild.id,
        },
        { headers: { pastille_botid: process.env.BOT_ID } }
      )
    ).data;
  } catch (err: any) {
    Logs(["automod", "add", "warn"], "error", err, guild.id);
    return false;
  }
};

/**
 * Return formated hours
 *
 * @param {undefined|Date} date
 * @returns {string}
 */
export const hoursParser = async (date?: any) => {
  if (date === undefined) {
    date = new Date();
  }

  const hours = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours();
  const minutes =
    date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
  const seconds =
    date.getSeconds() < 10 ? `0${date.getSeconds()}` : date.getSeconds();

  return `${hours}:${minutes}:${seconds}`;
};

/**
 * Return formated date
 *
 * @param {undefined|Date} date
 * @returns {string}
 */
export const dateParser = async (date?: any) => {
  if (date === undefined) {
    date = new Date();
  }

  const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
  const month =
    date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};
