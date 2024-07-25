import { Events } from "discord.js";
import { bangRule } from "./interaction/bang/bangRule";
import { bangStatus } from "./interaction/bang/bangStatus";
import { bangExecute } from "./interaction/bang/bangExecute";
import {
  dateParser,
  getCommands,
  getParams,
  hoursParser,
} from "@functions/base";
import logs from "@functions/logs";

export const messageCreateEventInit = (client: {
  on: (arg0: Events, arg1: (message: any) => Promise<void>) => void;
  guilds: { cache: any[] };
}) => {
  client.on(
    Events.MessageCreate,
    async (message: {
      content: any;
      guildId: any;
      channelId: any;
      author: { bot: boolean; globalName: any };
      attachments: { size: any };
      startThread: (arg0: {
        name: string;
        autoArchiveDuration: number;
        reason: string;
      }) => any;
    }) => {
      const content = message.content;
      const guild = client.guilds.cache.find(
        (guild: { id: any }) => guild.id === message.guildId
      );
      const channel = guild.channels.cache.find(
        (channel: { id: any }) => channel.id === message.channelId
      );

      const guildParams = await getParams(guild);
      const { options } = guildParams;

      const splitedMsg = content.split(" ");
      const cmd = splitedMsg.shift().slice(1);

      if (message.author.bot === true) {
        return;
      }
      if (content.startsWith(options.bang)) {
        const guildCommands = await getCommands(guild);

        if (cmd === "regles") {
          bangRule(message, guild);
          return;
        }
        if (cmd === "status") {
          bangStatus(message, guild);
          return;
        }

        if (guildCommands) {
          guildCommands.map(async (item: { _id: any; terms: any }) => {
            const { _id, terms } = item;
            if (cmd === terms) {
              await bangExecute(message, guild, _id);
            }
          });
        }
      }

      if (channel.name === options.channels.screenshots) {
        if (message.attachments.size) {
          try {
            const title = `${
              message.author.globalName
            } (${await dateParser()} ${await hoursParser()})`;
            const thread = await message.startThread({
              name: title,
              autoArchiveDuration: 4320,
              reason: "New screenshots posted",
            });
          } catch (error: any) {
            logs("error", "thread:screenshots", error);
            return;
          }
        }
      }

      return;
    }
  );
};
