import { readdirSync } from "node:fs";
import { join } from "node:path";
import { REST, Routes } from "discord.js";
import { logs } from "../function/logs";

const commands = [];
const foldersPath = join(__dirname, "../commands");
const commandFolders = readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = join(foldersPath, folder);
  const commandFiles = readdirSync(commandsPath).filter((file) =>
    file.endsWith(".js")
  );

  for (const file of commandFiles) {
    const filePath = join(commandsPath, file);
    const command = require(filePath);
    if ("data" in command) {
      commands.push(command.data);
    } else {
      logs(
        "warning",
        "commands:register",
        `The command at ${filePath} is missing a required "data" property.`
      );
    }
  }
}

const commandRegister = async (guild) => {
  const rest = new REST().setToken(process.env.BOT_TOKEN);
  await (async () => {
    try {
      logs(
        "infos",
        "command:register",
        `Refreshing ${commands.length} (/) commands`,
        guild.id
      );
      const data = await rest.put(
        Routes.applicationGuildCommands(process.env.BOT_ID, guild.id),
        { body: commands }
      );
      logs(
        "infos",
        "command:register",
        `Reloaded ${data.length} (/) commands`,
        guild.id
      );
    } catch (error) {
      logs("error", "command:register", error, guild.id);
    }
  })();
};

const commandDelete = async (guild) => {
  const rest = new REST().setToken(process.env.BOT_TOKEN);
  await (async () => {
    try {
      logs(
        "infos",
        "command:register",
        `Deleting ${commands.length} (/) commands`,
        guild.id
      );
      await rest
        .put(Routes.applicationGuildCommands(process.env.BOT_ID, guild.id), {
          body: [],
        })
        .then(() => {
          logs(
            "infos",
            "command:deleting",
            `Deleted ${data.length} (/) commands`,
            guild.id
          );
        })
        .catch((error) => {
          logs("error", "command:deleting", error, guild.id);
        });
    } catch (error) {
      logs("error", "command:register", error, guild.id);
    }
  })();
};

export default { commandRegister, commandDelete };
