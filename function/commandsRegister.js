const fs = require('node:fs');
const path = require('node:path');
const { REST, Routes } = require('discord.js');
const { BOT_ID, BOT_TOKEN } = require('../config/secret.json');
const { logs } = require('../function/logs');

const commands = [];
const foldersPath = path.join(__dirname, '../commands');
const commandFolders = fs.readdirSync(foldersPath);

for(const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

  for(const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if('data' in command) {
      commands.push(command.data);
    } else {
      logs('warning', 'commands:register', `The command at ${filePath} is missing a required "data" property.`);
    }
  }
}

const commandRegister = async (guild) => {
  const rest = new REST().setToken(BOT_TOKEN);
  (async () => {
    try {
      logs('infos', 'command:register', `Started refreshing ${commands.length} application (/) commands`, guild.id);
      const data = await rest.put(
          Routes.applicationGuildCommands(BOT_ID, guild.id),
          { body: commands },
      );
      logs('infos', 'command:register', `Successfully reloaded ${data.length} application (/) commands`, guild.id);
    }
    catch (error) { logs('error', 'command:register', error, guild.id); }
  })();
}

module.exports = { commandRegister };