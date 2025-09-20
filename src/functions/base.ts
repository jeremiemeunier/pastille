import Logs from "@libs/Logs";
import pastilleAxios from "@libs/PastilleAxios";

/**
 * Return a json object with addons registred for this guild
 *
 * @param {object} guild Discord guild item
 * @returns {boolean|object} false on err | A json object with all registred addons for guild on success
 */
export const getAddons = async ({ guild }: { guild: any }) => {
  try {
    const guildAddonsRequest = await pastilleAxios.get("/addons", {
      params: { guild_id: guild?.id },
    });
    const guildAddons = guildAddonsRequest.data.data;
    return guildAddons;
  } catch (err: any) {
    if (err.http_response === 404) {
      Logs("addon:load:guild", "warning", err, guild?.id);
      return false;
    } else {
      Logs("addon:load:guild", "error", err, guild?.id);
      return false;
    }
  }
};

/**
 * Return a json object with banned words registred for this guild
 *
 * @param {object} guild Discord guild item
 * @returns {boolean|object} false on err | A json object with all registred banned word for guild on success
 */
export const getBanWord = async ({ guild }: { guild: any }) => {
  try {
    const guildBanWordsRequest = await pastilleAxios.get("/banwords", {
      params: { guild_id: guild?.id },
      headers: { pastille_botid: process.env.BOT_ID },
    });
    const guildBanWords = guildBanWordsRequest.data.data;
    return guildBanWords;
  } catch (err: any) {
    if (err.http_response === 404) {
      Logs("automod:load:banword", "warning", err, guild?.id);
      return false;
    } else {
      Logs("automod:load:banword", "error", err, guild?.id);
      return false;
    }
  }
};

/**
 * Return a json object with streamer registred for this guild
 *
 * @param {object} guild Discord guild item
 * @returns {boolean|object} false on err | A json object with all registred streamer for guild on success
 */
export const getStreamers = async ({ guild }: { guild: any }) => {
  try {
    const guildStreamersRequest = await pastilleAxios.get("/twitch", {
      params: { guild_id: guild?.id },
      headers: { pastille_botid: process.env.BOT_ID },
    });
    const guildStreamersList = guildStreamersRequest.data.data;

    return guildStreamersList;
  } catch (err: any) {
    Logs("global:get:streamer_list", "error", err, guild?.id);
    return false;
  }
};

/**
 * Return a json object with roles registred for this guild
 *
 * @param {object} guild Discord guild item
 * @returns {boolean|object} false on err | A json object with all registred roles for guild on success
 */
export const getRoles = async ({ guild }: { guild: any }) => {
  try {
    const guildRolesrequest = await pastilleAxios.get("/roles", {
      params: { guild_id: guild?.id },
      headers: { pastille_botid: process.env.BOT_ID },
    });
    const guildRoles = guildRolesrequest.data.data;
    return guildRoles;
  } catch (err: any) {
    if (err.http_response === 404) {
      Logs("roles:load:guild", "warning", err, guild?.id);
      return false;
    } else {
      Logs("roles:load:guild", "error", err, guild?.id);
      return false;
    }
  }
};

/**
 * Return a json object with rules registred for this guild
 *
 * @param {object} guild Discord guild item
 * @returns {boolean|object} false on err | A json object with all registred rules for guild on success
 */
export const getRules = async ({ guild }: { guild: any }) => {
  try {
    const guildRulesRequest = await pastilleAxios.get("/rules", {
      params: { guild_id: guild?.id },
      headers: { pastille_botid: process.env.BOT_ID },
    });
    const guildRules = guildRulesRequest.data.data;
    return guildRules;
  } catch (err: any) {
    if (err.http_response === 404) {
      Logs("rules:load:guild", "warning", err, guild?.id);
      return false;
    } else {
      Logs("rules:load:guild", "error", err, guild?.id);
      return false;
    }
  }
};

export const getCommands = async ({ guild, id }: { guild: any; id?: any }) => {
  if (id) {
    try {
      const guildCommandsRequest = await pastilleAxios.get("/commands/id", {
        params: { id: id },
      });
      const guildCommands = guildCommandsRequest.data.data;
      return guildCommands;
    } catch (err: any) {
      if (err.http_response === 404) {
        Logs("cmd:load:guild", "warning", err, guild?.id);
        return false;
      } else {
        Logs("cmd:load:guild", "error", err, guild?.id);
        return false;
      }
    }
  } else {
    try {
      const guildCommandsRequest = await pastilleAxios.get("/commands", {
        params: { guild_id: guild?.id },
        headers: { pastille_botid: process.env.BOT_ID },
      });
      const guildCommands = guildCommandsRequest.data.data;
      return guildCommands;
    } catch (err: any) {
      if (err.http_response === 404) {
        Logs("cmds:load:guild", "warning", err, guild?.id);
        return false;
      } else {
        Logs("cmds:load:guild", "error", err, guild?.id);
        return false;
      }
    }
  }
};

/**
 * Return a json object with settings registred for this guild
 *
 * @param {object} guild Discord guild item
 * @returns {boolean|object} false on err | A json object with settings for guild on success
 */
export const getParams = async ({ guild }: { guild: any }) => {
  try {
    const guildParamsRequest = await pastilleAxios.get("/settings", {
      params: { guild_id: guild?.id },
      headers: { pastille_botid: process.env.BOT_ID },
    });
    const guildParams = guildParamsRequest.data.data;
    return guildParams;
  } catch (err: any) {
    if (err.http_response === 404) {
      Logs("params:load:guild", "warning", err, guild?.id);
      return false;
    } else {
      Logs("params:load:guild", "error", err, guild?.id);
      return false;
    }
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
  guild: any;
  data: any;
}) => {
  try {
    const warnUserRequest = await pastilleAxios.post(
      "/infraction",
      {
        user_id: data.user_id,
        reason: data.reason,
        date: new Date(),
        guild_id: guild?.id,
      },
      { headers: { pastille_botid: process.env.BOT_ID } }
    );

    return warnUserRequest.data.data;
  } catch (err: any) {
    Logs("automod:add:warn", "error", err, guild?.id);
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
