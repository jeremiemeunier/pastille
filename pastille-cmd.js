const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');

let secret_settings = JSON.parse(fs.readFileSync('data/secret.json'));
const commands = [
    { name: "role",
      description: "Ajoute les rôles de ton choix" },
    { name: "mods",
      description: "Demande de l'aide à nos modérateurs" },
      { name: "help",
        description: "Obtiens de l'aide sur les différentes commandes" },
    { name: "notifs",
      description: "Sélectionne les notifications que tu veux recevoir" },
    {
      name: "poll",
      description: "Crée un sondage",
      options: [
        {
          name: "question",
          description: "Quelle est la question ?",
          type: 3,
          required: true
        },
        {
          name: "response",
          description: "Quelles sont les réponses (maximum 5) ? (Il faudra séparer les réponses possible par un \";\")",
          type: 3,
          required: true
        }
      ]
    }
];

const rest = new REST({ version: '10' }).setToken(secret_settings.BOT_TOKEN);

(async () => {
	try {
	  await rest.put(
      Routes.applicationGuildCommands(secret_settings.BOT_ID, secret_settings.GUILD_ID),
      { body: commands },
	  );
	  console.log('Successfully reloaded application (/) commands.');
	} catch (error) { console.error(error); }
 })();