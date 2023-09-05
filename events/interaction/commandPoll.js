const fs = require('node:fs');
const { Events, EmbedBuilder } = require('discord.js');
const alphabetLetters = JSON.parse(fs.readFileSync('./data/alphabet.json'));
const { logsEmiter } = require('../../function/logs');
const { options } = require ('../../config/settings.json');

let client;

const commandPollInit = (clientItem) => {

    client = clientItem;

    client.on(Events.InteractionCreate, async interaction => {
        if (!interaction.isChatInputCommand()) return;
            const { commandName } = interaction;
        
        if(commandName === 'poll') {
            let pollChoices = '';
    
            for(let i = 0;i<22;i++) {
                if(interaction.options.getString(`choice_${alphabetLetters[i].letter}`) === null) {
                    const embed = new EmbedBuilder()
                                        .setColor(`${options.color}`)
                                        .setTitle(interaction.options.getString('question'))
                                        .setDescription(pollChoices);
                    const message = await interaction.reply({ embeds: [embed], fetchReply: true, content: "Nouveau sondage ! ||@here||" });
                    for(let j = 0;j < i;j++) {
                        let first = interaction.options.getString(`choice_${alphabetLetters[j].letter}`).split(' ')[0];
                        let letter = alphabetLetters[j].emoji;
    
                        try { await message.react(first); }
                        catch(error) {
                            try { await message.react(letter); }
                            catch(error) { logsEmiter(`An error occured [commandPollInit] : \r\n ${error}`); }
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