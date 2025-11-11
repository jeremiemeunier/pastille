import { readdirSync } from "node:fs";
import { join } from "node:path";
import { REST, Routes } from "discord.js";
import Logs from "@libs/Logs";

const guildCmds: any[] = [];
const userCmds: any[] = [];
const foldersPath = join(__dirname, "../commands");
const commandFolders = readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = join(foldersPath, folder);
  const commandFiles = readdirSync(commandsPath).filter((file) =>
    file.endsWith(".ts")
  );

  if (folder === "user") {
    for (const file of commandFiles) {
      const filePath = join(commandsPath, file);
      const command = require(filePath);
      if ("data" in command) {
        userCmds.push(command.data);
      } else {
        Logs(
          ["commands", "register"],
          "warning",
          `the command at ${filePath} is missing a required "data" property.`
        );
      }
    }
  } else {
    for (const file of commandFiles) {
      const filePath = join(commandsPath, file);
      const command = require(filePath);
      if ("data" in command) {
        guildCmds.push(command.data);
      } else {
        Logs(
          ["commands", "register"],
          "warning",
          `the command at ${filePath} is missing a required "data" property.`
        );
      }
    }
  }
}

export const CommandRegisterDaemon = async (guild: any) => {
  const rest = new REST().setToken(process.env.BOT_TOKEN as string);
  await (async () => {
    try {
      Logs(
        ["daemon", "command"],
        null,
        `refreshing ${guildCmds.length} guilds commands`,
        guild?.id
      );
      const data: any = await rest.put(
        Routes.applicationGuildCommands(
          process.env.BOT_ID as string,
          guild?.id
        ),
        { body: guildCmds }
      );
      Logs(
        ["daemon", "command"],
        null,
        `reloaded ${data.length} guilds commands`,
        guild?.id
      );
    } catch (err: any) {
      Logs(["daemon", "command"], "error", err, guild?.id);
    }

    try {
      Logs(
        ["daemon", "command"],
        null,
        `refreshing ${userCmds.length} global commands`
      );
      const data: any = await rest.put(
        Routes.applicationCommands(process.env.BOT_ID as string),
        { body: userCmds }
      );
      Logs(
        ["daemon", "command"],
        null,
        `reloaded ${data.length} global commands`
      );
    } catch (err: any) {
      Logs(["daemon", "command"], "error", err);
    }
  })();
};
