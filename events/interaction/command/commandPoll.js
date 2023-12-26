const fs = require('node:fs');
const { Events, EmbedBuilder } = require('discord.js');
const alphabetLetters = JSON.parse(fs.readFileSync('./config/data/alphabet.json'));
const { logs } = require('../../../function/logs');
const { getParams } = require('../../../function/base');

const commandPollInit = async (client) => {
  client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) { return; }
    const { commandName } = interaction;

    const guildParams = await getParams(interaction.guild);
    const { options } = guildParams;
        
    if(commandName === 'poll') {
      let pollChoices = '';

      for(let i = 0;i<22;i++) {
        if(interaction.options.getString(`choice_${alphabetLetters[i].letter}`) === null) {
          const embed = new EmbedBuilder({
            color: parseInt(options.color, 16),
            title: interaction.options.getString('question'),
            description: pollChoices,
          });
          const message = await interaction.reply({
            embeds: [embed], fetchReply: true, content: "Nouveau sondage ! ||@here||" });
          for(let j = 0;j < i;j++) {
            let first = interaction.options.getString(`choice_${alphabetLetters[j].letter}`).split(' ')[0];
            let letter = alphabetLetters[j].emoji;

            try { await message.react(first); }
            catch(error) {
              try { await message.react(letter); }
              catch(error) { logs("error", "command:poll", error); }
            }
          }
          break;
        }
        else {
          pollChoices = pollChoices + `\r\n${alphabetLetters[i].emoji} ${interaction.options.getString(`choice_${alphabetLetters[i].letter}`)}`;
        }
      }
    }
  });
}

module.exports = { commandPollInit }