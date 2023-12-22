const fs = require('node:fs');
const path = require('node:path');
const { REST, Routes } = require('discord.js');
const { BOT_ID, BOT_TOKEN } = require('../config/secret.json');
const { logs } = require('../function/logs');

const commands = [];
const foldersPath = path.join(__dirname, '../commands');
const commandFolders = fs.readdirSync(foldersPath);

let client;

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

const commandRegister = async (GUILD_ID) => {
    const rest = new REST().setToken(BOT_TOKEN);
    const guildName = client.guilds.cache.find(guild => guild.id === GUILD_ID).name;
    (async () => {
        try {
            logs('infos', 'command:register', `Started refreshing ${commands.length} application (/) commands for ${guildName}.`);
            const data = await rest.put(
                Routes.applicationGuildCommands(BOT_ID, GUILD_ID),
                { body: commands },
            );
            logs('infos', 'command:register', `Successfully reloaded ${data.length} application (/) commands for ${guildName}.`);
        }
        catch (error) { logs('error', 'command:register', error); }
    })();
}

const commandRegisterInit = async (clientItem, guildId) => {
    client = clientItem;

    if(guildId !== undefined) {
        await commandRegister(guildId);
    }
    else {
        const clientGuildQuantity = client.guilds.cache.map(guild => guild.id).length;
        const clientGuildIds = client.guilds.cache.map(guild => guild.id);

        for(let i = 0;i < clientGuildQuantity;i++) {
            await commandRegister(clientGuildIds[i]);
        }
    }
}

module.exports = { commandRegister, commandRegisterInit };