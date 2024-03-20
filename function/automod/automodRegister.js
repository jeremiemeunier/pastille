import { logs } from "../logs";
import axios from "axios";
import { automodSanction } from "./automodSanction";

export const automodRegister = async (user, reason, guild) => {
  const userId = user.user.id;
  const today = new Date();

  // On créer un nouveau register
  try {
    const addNewInfraction = await axios.post("/infraction", {
      user_id: userId,
      reason: reason,
      date: today,
      guild_id: guild.id,
    });

    // On vérifie le nombre de warn
    try {
      const totalWarnUser = await axios.get("/infraction/all", {
        params: { user_id: userId, guild_id: guild.id },
      });
      automodSanction(user, totalWarnUser, guild);
    } catch (error) {
      logs("error", "automod:get:infractions", error, guild.id);
    }
  } catch (error) {
    logs("error", "automod:register", error, guild.id);
  }
};
