import { get, post } from "axios";
import { logs } from "../function/logs";

/**
 * Return a json object with addons registred for this guild
 *
 * @param {object} guild Discord guild item
 * @returns {boolean|object} false on error | A json object with all registred addons for guild on success
 */
const getAddons = async (guild) => {
  try {
    const guildAddonsRequest = await get("/addons", {
      params: { guild_id: guild.id },
      headers: { pastille_botid: process.env.BOT_ID },
    });
    const guildAddons = guildAddonsRequest.data.data;
    return guildAddons;
  } catch (error) {
    logs("error", "global:get:guild_addons", error, guild.id);
    return false;
  }
};

/**
 * Return a json object with banned words registred for this guild
 *
 * @param {object} guild Discord guild item
 * @returns {boolean|object} false on error | A json object with all registred banned word for guild on success
 */
const getBanWord = async (guild) => {
  try {
    const guildBanWordsRequest = await get("/banwords", {
      params: { guild_id: guild.id },
      headers: { pastille_botid: process.env.BOT_ID },
    });
    const guildBanWords = guildBanWordsRequest.data.data;
    return guildBanWords;
  } catch (error) {
    logs("error", "global:get:guild_ban_word", error, guild.id);
    return false;
  }
};

/**
 * Return a json object with streamer registred for this guild
 *
 * @param {object} guild Discord guild item
 * @returns {boolean|object} false on error | A json object with all registred streamer for guild on success
 */
const getStreamers = async (guild) => {
  try {
    const guildStreamersRequest = await get("/twitch", {
      params: { guild_id: guild.id },
      headers: { pastille_botid: process.env.BOT_ID },
    });
    const guildStreamersList = guildStreamersRequest.data.data;

    return guildStreamersList;
  } catch (error) {
    logs("error", "global:get:streamer_list", error, guild.id);
    return false;
  }
};

/**
 * Return a json object with roles registred for this guild
 *
 * @param {object} guild Discord guild item
 * @returns {boolean|object} false on error | A json object with all registred roles for guild on success
 */
const getRoles = async (guild) => {
  try {
    const guildRolesrequest = await get("/roles", {
      params: { guild_id: guild.id },
      headers: { pastille_botid: process.env.BOT_ID },
    });
    const guildRoles = guildRolesrequest.data.data;
    return guildRoles;
  } catch (error) {
    logs("error", "global:get:guild_rules", error, guild.id);
    return false;
  }
};

/**
 * Return a json object with rules registred for this guild
 *
 * @param {object} guild Discord guild item
 * @returns {boolean|object} false on error | A json object with all registred rules for guild on success
 */
const getRules = async (guild) => {
  try {
    const guildRulesRequest = await get("/rules", {
      params: { guild_id: guild.id },
      headers: { pastille_botid: process.env.BOT_ID },
    });
    const guildRules = guildRulesRequest.data.data;
    return guildRules;
  } catch (error) {
    logs("error", "global:get:guild_rules", error, guild.id);
    return false;
  }
};

const getLetters = async (letter, limit = -1) => {
  if (letter) {
    try {
      const appLetterRequest = await get("/emotes", {
        params: { letter: letter },
        headers: { pastille_botid: process.env.BOT_ID },
      });
      const appLetter = appLetterRequest.data.data;
      return appLetter;
    } catch (error) {
      logs("error", "global:get:letter", error);
      return false;
    }
  } else {
    try {
      const appLettersRequest = await get("/emotes/all", {
        params: { limit: limit },
        headers: { pastille_botid: process.env.BOT_ID },
      });
      const appLetters = appLettersRequest.data.data;
      return appLetters;
    } catch (error) {
      logs("error", "global:get:letters", error);
      return false;
    }
  }
};

const getCommands = async (guild, id) => {
  if (id) {
    try {
      const guildCommandsRequest = await get("/commands/id", {
        params: { id: id },
        headers: { pastille_botid: process.env.BOT_ID },
      });
      const guildCommands = guildCommandsRequest.data.data;
      return guildCommands;
    } catch (error) {
      logs("error", "global:get:guild_commands:id", error, guild.id);
      return false;
    }
  } else {
    try {
      const guildCommandsRequest = await get("/commands", {
        params: { guild_id: guild.id },
        headers: { pastille_botid: process.env.BOT_ID },
      });
      const guildCommands = guildCommandsRequest.data.data;
      return guildCommands;
    } catch (error) {
      logs("error", "global:get:guild_commands", error, guild.id);
      return false;
    }
  }
};

/**
 * Return a json object with settings registred for this guild
 *
 * @param {object} guild Discord guild item
 * @returns {boolean|object} false on error | A json object with settings for guild on success
 */
const getParams = async (guild) => {
  try {
    const guildParamsRequest = await get("/settings", {
      params: { guild_id: guild.id },
      headers: { pastille_botid: process.env.BOT_ID },
    });
    const guildParams = guildParamsRequest.data.data;
    return guildParams;
  } catch (error) {
    logs("error", "global:get:guild_params", error, guild.id);
    return false;
  }
};

/**
 * Add a warn on user for reason pass in parameters
 *
 * @param {object} guild Discord guild item
 * @param {object} data A json object with user_id and reason
 * @returns {boolean|object} false on error | A json object with new registred warn for user on success
 */
const postWarnUser = async (guild, data) => {
  try {
    const warnUserRequest = post(
      "/infraction",
      {
        user_id: data.user_id,
        reason: data.reason,
        date: new Date(),
        guild_id: guild.id,
      },
      { headers: { pastille_botid: process.env.BOT_ID } }
    );

    return warnUserRequest.data.data;
  } catch (error) {
    logs("error", "global:post:infraction", error, guild.id);
    return false;
  }
};

/**
 * Return formated hours
 *
 * @param {undefined|Date} date
 * @returns {string}
 */
const hoursParser = async (date) => {
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
const dateParser = async (date) => {
  if (date === undefined) {
    date = new Date();
  }

  const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
  const month =
    date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth();
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

export default {
  hoursParser,
  dateParser,
  getParams,
  getAddons,
  getRules,
  getRoles,
  getCommands,
  getLetters,
  getBanWord,
  getStreamers,
  postWarnUser,
};
