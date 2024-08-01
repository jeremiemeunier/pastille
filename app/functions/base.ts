import logs from "./logs";
import pastilleAxios from "@libs/PastilleAxios";

/**
 * Return a json object with addons registred for this guild
 *
 * @param {object} guild Discord guild item
 * @returns {boolean|object} false on error | A json object with all registred addons for guild on success
 */
export const getAddons = async (guild: any) => {
  try {
    const guildAddonsRequest = await pastilleAxios.get("/addons", {
      params: { guild_id: guild.id },
    });
    const guildAddons = guildAddonsRequest.data.data;
    return guildAddons;
  } catch (error: any) {
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
export const getBanWord = async (guild: any) => {
  try {
    const guildBanWordsRequest = await pastilleAxios.get("/banwords", {
      params: { guild_id: guild.id },
      headers: { pastille_botid: process.env.BOT_ID },
    });
    const guildBanWords = guildBanWordsRequest.data.data;
    return guildBanWords;
  } catch (error: any) {
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
export const getStreamers = async (guild: any) => {
  try {
    const guildStreamersRequest = await pastilleAxios.get("/twitch", {
      params: { guild_id: guild.id },
      headers: { pastille_botid: process.env.BOT_ID },
    });
    const guildStreamersList = guildStreamersRequest.data.data;

    return guildStreamersList;
  } catch (error: any) {
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
export const getRoles = async (guild: any) => {
  try {
    const guildRolesrequest = await pastilleAxios.get("/roles", {
      params: { guild_id: guild.id },
      headers: { pastille_botid: process.env.BOT_ID },
    });
    const guildRoles = guildRolesrequest.data.data;
    return guildRoles;
  } catch (error: any) {
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
export const getRules = async (guild: any) => {
  try {
    const guildRulesRequest = await pastilleAxios.get("/rules", {
      params: { guild_id: guild.id },
      headers: { pastille_botid: process.env.BOT_ID },
    });
    const guildRules = guildRulesRequest.data.data;
    return guildRules;
  } catch (error: any) {
    logs("error", "global:get:guild_rules", error, guild.id);
    return false;
  }
};

export const getLetters = async (letter: any, limit: number = -1) => {
  if (letter) {
    try {
      const appLetterRequest = await pastilleAxios.get("/emotes", {
        params: { letter: letter },
        headers: { pastille_botid: process.env.BOT_ID },
      });
      const appLetter = appLetterRequest.data.data;
      return appLetter;
    } catch (error: any) {
      logs("error", "global:get:letter", error);
      return false;
    }
  } else {
    try {
      const appLettersRequest = await pastilleAxios.get("/emotes/all", {
        params: { limit: limit },
        headers: { pastille_botid: process.env.BOT_ID },
      });
      const appLetters = appLettersRequest.data.data;
      return appLetters;
    } catch (error: any) {
      logs("error", "global:get:letters", error);
      return false;
    }
  }
};

export const getCommands = async (guild: any, id?: any) => {
  if (id) {
    try {
      const guildCommandsRequest = await pastilleAxios.get("/commands/id", {
        params: { id: id },
      });
      const guildCommands = guildCommandsRequest.data.data;
      return guildCommands;
    } catch (error: any) {
      logs("error", "global:get:guild:cmd:id", error, guild.id);
      return false;
    }
  } else {
    try {
      const guildCommandsRequest = await pastilleAxios.get("/commands", {
        params: { guild_id: guild.id },
        headers: { pastille_botid: process.env.BOT_ID },
      });
      const guildCommands = guildCommandsRequest.data.data;
      return guildCommands;
    } catch (error: any) {
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
export const getParams = async (guild: any) => {
  try {
    const guildParamsRequest = await pastilleAxios.get("/settings", {
      params: { guild_id: guild.id },
      headers: { pastille_botid: process.env.BOT_ID },
    });
    const guildParams = guildParamsRequest.data.data;
    return guildParams;
  } catch (error: any) {
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
export const postWarnUser = async (guild: any, data: any) => {
  try {
    const warnUserRequest = await pastilleAxios.post(
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
  } catch (error: any) {
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
    date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth();
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};
