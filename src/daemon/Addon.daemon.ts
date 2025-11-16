import { AddonsTypes } from "@/types/Addons.types";
import { cwd } from "process";
import Logs from "@libs/Logs";
import { getAddons } from "@functions/Base.function";
import { Guild } from "discord.js";

export const AddonRegisterDaemon = async (guild: Guild) => {
  const guildAddons = await getAddons({ guild: guild });
  AddonsRegister(guildAddons, guild);
};

export const AddonsRegister = async (addons: any, guild: Guild) => {
  if (addons) {
    try {
      addons.map((item: AddonsTypes) => {
        item.active
          ? Logs({
              node: ["daemon", "addons"],
              state: null,
              content: `[\x1b[32m ACTIVE \x1b[0m] ${item.name}`,
              details: guild?.id,
            })
          : Logs({
              node: ["daemon", "addons"],
              state: null,
              content: `[\x1b[31mINACTIVE\x1b[0m] ${item.name}`,
              details: guild?.id,
            });

        if (item.active) {
          try {
            const { addonsLoaded } = require(`${cwd()}/src/modules/${
              item.name
            }`);
            addonsLoaded(guild, item);
          } catch (err: any) {
            Logs({
              node: ["daemon", "addons", "load"],
              state: "error",
              content: err,
            });
          }
        }
      });
    } catch (err: any) {
      Logs({ node: ["daemon", "addons", "map"], state: "error", content: err });
    }
  }
};
