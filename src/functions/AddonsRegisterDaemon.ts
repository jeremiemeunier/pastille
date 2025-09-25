import { getAddons } from "./base";
import { AddonsTypes } from "@/types/Addons.types";
import { cwd } from "process";
import Logs from "@libs/Logs";

export const AddonRegisterDaemon = async (guild: any) => {
  const guildAddons = await getAddons({ guild: guild });
  AddonsRegister(guildAddons, guild);
};

export const AddonsRegister = async (addons: any, guild: any) => {
  if (addons) {
    try {
      addons.map((item: AddonsTypes) => {
        item.active
          ? Logs(
              "daemon:addons",
              null,
              `[\x1b[32m ACTIVE \x1b[0m] ${item.name}`,
              guild?.id
            )
          : Logs(
              "daemon:addons",
              null,
              `[\x1b[31mINACTIVE\x1b[0m] ${item.name}`,
              guild?.id
            );

        if (item.active) {
          try {
            const { addonsLoaded } = require(`${cwd()}/src/modules/${
              item.name
            }`);
            addonsLoaded(guild, item);
          } catch (err: any) {
            Logs("daemon:addons:load", "error", err);
          }
        }
      });
    } catch (err: any) {
      Logs("daemon:addons:map", "error", err);
    }
  }
};

export const addonsLaunch = (addons: any) => {};
