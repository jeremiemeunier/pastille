import { Events } from "discord.js";
import {
  getParams,
  hoursParser,
  dateParser,
  getCommands,
} from "../function/base";
import { bangRule } from "./interaction/bang/bangRule";
import { bangStatus } from "./interaction/bang/bangStatus";
import { logs } from "../function/logs";
import { bangExecute } from "./interaction/bang/bangExecute";

const messageCreateEventInit = (client) => {
  client.on(Events.MessageCreate, async (message) => {
    const content = message.content;
    const guild = client.guilds.cache.find(
      (guild) => guild.id === message.guildId
    );
    const channel = guild.channels.cache.find(
      (channel) => channel.id === message.channelId
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
        guildCommands.map(async (item) => {
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
          const title = `${message.author.globalName} (${await dateParser()} ${await hoursParser()})`;
          const thread = await message.startThread({
            name: title,
            autoArchiveDuration: 4320,
            reason: "New screenshots posted",
          });
        } catch (error) {
          logs("error", "thread:screenshots", error);
          return;
        }
      }
    }

    return;
  });
};

export default { messageCreateEventInit };
