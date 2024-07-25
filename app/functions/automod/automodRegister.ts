import { automodSanction } from "./automodSanction";
import logs from "@functions/logs";
import pastilleAxios from "@libs/PastilleAxios";

export const automodRegister = async (user: any, reason: any, guild: any) => {
  const userId = user.user.id;
  const today = new Date();

  // On créer un nouveau register
  try {
    const addNewInfraction = await pastilleAxios.post("/infraction", {
      user_id: userId,
      reason: reason,
      date: today,
      guild_id: guild.id,
    });

    // On vérifie le nombre de warn
    try {
      const totalWarnUser = await pastilleAxios.get("/infraction/all", {
        params: { user_id: userId, guild_id: guild.id },
      });
      automodSanction(user, totalWarnUser, guild);
    } catch (error: any) {
      logs("error", "automod:get:infractions", error, guild.id);
    }
  } catch (error: any) {
    logs("error", "automod:register", error, guild.id);
  }
};
