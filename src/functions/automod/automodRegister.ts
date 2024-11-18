import Logs from "@libs/Logs";
import { automodSanction } from "./automodSanction";
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
      Logs("automod:get:infractions", "error", error, guild.id);
    }
  } catch (error: any) {
    Logs("automod:register", "error", error, guild.id);
  }
};
