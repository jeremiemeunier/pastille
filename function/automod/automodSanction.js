import { logs } from "../logs";
import { post } from "axios";
import { getParams } from "../base";
import { automodApply, automodFinalNotify } from "./automodVerifer";

const automodSanctionEvalute = async (size, guild) => {
  const guildParams = await getParams(guild);
  const { moderation } = guildParams;
  const { sanctions } = moderation;

  if (size === 3 || size === 6 || size === 9) {
    // Sanction temporaire de mute LEVEL: low
    const duration = durationInterpreter(sanctions.low);
    const startTime = new Date();
    const endTime = new Date(Date.parse(new Date()) + duration);

    return {
      decision: "low",
      duration: duration,
      end: endTime,
      start: startTime,
    };
  } else if (size === 12 || size === 15 || size === 18) {
    // Sanction temporaire de mute LEVEL: medium
    const duration = durationInterpreter(sanctions.medium);
    const startTime = new Date();
    const endTime = new Date(Date.parse(new Date()) + duration);

    return {
      decision: "medium",
      duration: duration,
      end: endTime,
      start: startTime,
    };
  } else if (size === 21 || size === 24 || size === 27) {
    // Sanction temporaire de mute LEVEL: hight
    const duration = durationInterpreter(sanctions.hight);
    const startTime = new Date();
    const endTime = new Date(Date.parse(new Date()) + duration);

    return {
      decision: "hight",
      duration: duration,
      end: endTime,
      start: startTime,
    };
  } else if (size > 27) {
    // Ban définitifs du serveur
    return { decision: "ban" };
  }

  return { decision: "nothing" };
};

const automodSanction = async (user, size, guild) => {
  const { count } = size.data;
  const evaluation = await automodSanctionEvalute(count, guild);

  if (evaluation.decision === "nothing") {
    return;
  }
  if (evaluation.decision === "ban") {
    await automodFinalNotify(guild, user);
    guild.members.ban(user);
  } else {
    automodApply(guild, user, evaluation.duration);
    sanctionRegister(
      user.user.id,
      evaluation.decision,
      evaluation.start,
      evaluation.end,
      guild
    );
  }
};

const durationInterpreter = (sanctionData) => {
  const { duration, unit } = sanctionData;

  if (unit === "m") {
    return duration * (1000 * 60);
  } else if (unit === "h") {
    return duration * (1000 * 3600);
  } else if (unit === "d") {
    return duration * (1000 * 3600 * 24);
  }
};

const sanctionRegister = async (userId, level, start, end, guild) => {
  try {
    const register = await post("/sanction/add", {
      user_id: userId,
      guild_id: guild.id,
      level: level,
      date: start,
      end: end,
    });
  } catch (error) {
    logs("error", "automod:sanction:register:api", error, guild);
  }
};

export default { automodSanction };
