import { readdirSync } from "node:fs";
import { join } from "node:path";
import { REST, Routes } from "discord.js";
import Logs from "@libs/Logs";

const commands: any[] = [];
const foldersPath = join(__dirname, "../commands");
const commandFolders = readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = join(foldersPath, folder);
  const commandFiles = readdirSync(commandsPath).filter((file) =>
    file.endsWith(".ts")
  );

  for (const file of commandFiles) {
    const filePath = join(commandsPath, file);
    const command = require(filePath);
    if ("data" in command) {
      commands.push(command.data);
    } else {
      Logs(
        "commands:register",
        "warning",
        `The command at ${filePath} is missing a required "data" property.`
      );
    }
  }
}

export const CommandRegisterDaemon = async (guild: any) => {
  const rest = new REST().setToken(process.env.BOT_TOKEN as string);
  await (async () => {
    try {
      Logs(
        "daemon:command",
        null,
        `Refreshing ${commands.length} (/) commands`,
        guild.id
      );
      const data: any = await rest.put(
        Routes.applicationGuildCommands(process.env.BOT_ID as string, guild.id),
        { body: commands }
      );
      Logs(
        "daemon:command",
        null,
        `Reloaded ${data.length} (/) commands`,
        guild.id
      );
    } catch (error: any) {
      Logs("daemon:command", "error", error, guild.id);
    }
  })();
};
