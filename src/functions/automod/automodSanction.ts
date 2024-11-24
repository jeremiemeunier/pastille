import pastilleAxios from "@libs/PastilleAxios";
import { getParams } from "../base";
import { automodApply, automodFinalNotify } from "./automodVerifer";
import Logs from "@libs/Logs";

export const automodSanctionEvalute = async (size: any, guild: any) => {
  const guildParams = await getParams({ guild: guild });
  const { moderation } = guildParams;
  const { sanctions } = moderation;

  if (size === 3 || size === 6 || size === 9) {
    // Sanction temporaire de mute LEVEL: low
    const duration = durationInterpreter(sanctions.low) as number;
    const startTime = new Date();
    const endTime = new Date(Date.parse(new Date().toString()) + duration);

    return {
      decision: "low",
      duration: duration,
      end: endTime,
      start: startTime,
    };
  } else if (size === 12 || size === 15 || size === 18) {
    // Sanction temporaire de mute LEVEL: medium
    const duration = durationInterpreter(sanctions.medium) as number;
    const startTime = new Date();
    const endTime = new Date(Date.parse(new Date().toString()) + duration);

    return {
      decision: "medium",
      duration: duration,
      end: endTime,
      start: startTime,
    };
  } else if (size === 21 || size === 24 || size === 27) {
    // Sanction temporaire de mute LEVEL: hight
    const duration = durationInterpreter(sanctions.hight) as number;
    const startTime = new Date();
    const endTime = new Date(Date.parse(new Date().toString()) + duration);

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

export const automodSanction = async (user: any, size: any, guild: any) => {
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

export const durationInterpreter = (sanctionData: any) => {
  const { duration, unit } = sanctionData;

  if (unit === "m") {
    return duration * (1000 * 60);
  } else if (unit === "h") {
    return duration * (1000 * 3600);
  } else if (unit === "d") {
    return duration * (1000 * 3600 * 24);
  }
};

export const sanctionRegister = async (
  userId: any,
  level: any,
  start: any,
  end: any,
  guild: any
) => {
  try {
    const register = await pastilleAxios.post("/sanction/add", {
      user_id: userId,
      guild_id: guild.id,
      level: level,
      date: start,
      end: end,
    });
  } catch (error: any) {
    Logs("automod:sanction:register:api", "error", error, guild);
  }
};
