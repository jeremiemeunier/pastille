import { readFileSync } from "node:fs";
import { Events, EmbedBuilder } from "discord.js";
const alphabetLetters = JSON.parse(readFileSync("./config/data/alphabet.json"));
import { logs } from "../../../function/logs";
import { getParams } from "../../../function/base";

const commandPollInit = async (client, interaction) => {
  const { commandName } = interaction;
  if (commandName !== "poll") {
    return;
  }

  const guildParams = await getParams(interaction.guild);
  const { options } = guildParams;

  let pollChoices = "";

  for (let i = 0; i < 22; i++) {
    if (
      interaction.options.getString(`choice_${alphabetLetters[i].letter}`) ===
      null
    ) {
      const embed = new EmbedBuilder({
        color: parseInt(options.color, 16),
        title: interaction.options.getString("question"),
        description: pollChoices,
      });
      const message = await interaction.reply({
        embeds: [embed],
        fetchReply: true,
        content: "Nouveau sondage ! ||@here||",
      });
      for (let j = 0; j < i; j++) {
        let first = interaction.options
          .getString(`choice_${alphabetLetters[j].letter}`)
          .split(" ")[0];
        let letter = alphabetLetters[j].emoji;

        try {
          await message.react(first);
        } catch (error) {
          try {
            await message.react(letter);
          } catch (error) {
            logs("error", "command:poll", error);
          }
        }
      }
      break;
    } else {
      pollChoices =
        pollChoices +
        `\r\n${alphabetLetters[i].emoji} ${interaction.options.getString(`choice_${alphabetLetters[i].letter}`)}`;
    }
  }
};

export { commandPollInit };
