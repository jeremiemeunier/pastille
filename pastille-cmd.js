const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');

const alphabetLetters = JSON.parse(fs.readFileSync('data/alphabet.json'));

const pollOptions = () => {
  let options = [
    {
      "name": "question",
      "description": "La quesiton que tu souhaite poser",
      "type": 3,
      "required": true
    }
  ];

  for(let i = 0;i < 21; i++) {
    let optionContent = {
      "name": "choice_" + alphabetLetters[i]['letter'],
      "description": "Indique un choix. Tu peux mettre un emoji en premier pour changer la réaction du bot.",
      "type": 3,
      "required": false
    }
    options.push(optionContent);
  }

  return options;
};

let secret_settings = JSON.parse(fs.readFileSync('data/secret.json'));
const commands = [
    {
      name: "poll",
      description: "Crée un sondage",
      options: pollOptions()
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