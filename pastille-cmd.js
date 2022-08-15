const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');

let secret_settings = JSON.parse(fs.readFileSync('data/secret.json'));
const commands = [
    {
        name: "role",
        description: "Différentes possibilité sur les rôles",
        options: [
            {
                name: 'list',
                description: 'Liste l\'ensemble des rôle disponible avec cette commande',
                type: 1,
            },
            {
              name: "add",
              description: "Ajoute le rôle indiqué en paramètre",
              type: 1,
              options: [
                {
                  name: "role",
                  description: "Le rôle qu'il faut ajouter",
                  type: 8,
                  required: true
                },
                {
                  name: "user",
                  description: "L'utilisateur",
                  type: 6,
                  required: false
                }
              ]
          }
        ]
    },
    {
      "name": "poll",
      "description": "Crée un sondage",
      "options": [
        {
          "name": "question",
          "description": "Quelle est la question ?",
          "type": 3,
          "required": true
        },
        {
          "name": "response",
          "description": "Quelles sont les réponses (maximum 5) ? (Il faudra séparer les réponses possible par un \";\")",
          "type": 3,
          "required": true
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
	} catch (error) {
	  console.error(error);
	}
 })();