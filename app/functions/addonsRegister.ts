import { getAddons } from "./base";
import { AddonsTypes } from "@/types/Addons.types";
import { cwd } from "process";
import logs from "./logs";

export const addonsRegisterInit = async (guild: any) => {
  const guildAddons = await getAddons(guild);
  addonsRegister(guildAddons, guild);
};

export const addonsRegister = async (addons: any, guild: any) => {
  if (addons) {
    try {
      addons.map((item: AddonsTypes) => {
        item.active
          ? logs(null, "addons:register", `[ ACTIVE ] ${item.name}`, guild.id)
          : logs(null, "addons:register", `[INACTIVE] ${item.name}`, guild.id);

        if (item.active) {
          const { addonsLoaded } = require(`${cwd()}/app/modules/${item.name}`);
          addonsLoaded(guild, item);
        }
      });
    } catch (error: any) {
      logs("error", "addons:register:map", error);
    }
  } else {
    logs(null, "addons:register", "No addons", guild.id);
  }
};

export const addonsLaunch = (addons: any) => {};
